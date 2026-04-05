$ErrorActionPreference = "Stop"
$logPath = "P:\College Major Project\ai-resume-portal\ImplementationPlan\phase7_verify_log.txt"

function Write-Log($message) {
    Add-Content -Path $logPath -Value ("[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $message)
}

Set-Content -Path $logPath -Value "Phase 7 verification started"

try {
    $resumePath = "C:\Users\Admin\Downloads\Aditya_Rana_Resume.pdf"
    if (-not (Test-Path $resumePath)) {
        throw "Resume file not found at $resumePath"
    }

    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $employerEmail = "employer" + $timestamp + "@example.com"
    $seekerEmail = "seeker" + $timestamp + "@example.com"

    $employerRegister = @{ fullName = "Employer User"; email = $employerEmail; password = "Test@1234"; role = "EMPLOYER"; companyName = "Acme Corp" } | ConvertTo-Json
    $seekerRegister = @{ fullName = "Job Seeker"; email = $seekerEmail; password = "Test@1234"; role = "JOB_SEEKER" } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $employerRegister | Out-Null
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $seekerRegister | Out-Null
    Write-Log "Registered employer and seeker"

    $employerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $employerEmail; password = "Test@1234" } | ConvertTo-Json)
    $seekerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $seekerEmail; password = "Test@1234" } | ConvertTo-Json)

    $employerToken = $employerLogin.token
    $seekerToken = $seekerLogin.token
    Write-Log "Logged in employer and seeker"

    $jobBody = @{ title = "Backend Developer"; description = "Build REST APIs with Spring Boot and MySQL"; requiredSkills = "Java,Spring Boot,MySQL"; experienceRequired = "2-4 years"; salaryRange = "6-10 LPA"; location = "Remote"; jobType = "FULL_TIME"; deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") } | ConvertTo-Json
    $job = Invoke-RestMethod -Uri "http://localhost:8080/api/jobs" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $employerToken" } -Body $jobBody
    Write-Log ("Created job {0}" -f $job.id)

    Write-Log "Applying to job"
    $curlArgs = @(
        "-s",
        "-X", "POST",
        "-H", "Authorization: Bearer $seekerToken",
        "-F", "resume=@$resumePath",
        "-F", "coverLetter=Interested in the role.",
        "http://localhost:8080/api/applications/$($job.id)/apply"
    )
    $body = & curl.exe @curlArgs
    if ([string]::IsNullOrWhiteSpace($body)) {
        throw "Apply failed: empty response"
    }
    Write-Log ("Apply response length: {0}" -f $body.Length)

    $apply = $body | ConvertFrom-Json
    Write-Log ("Applied to job. Application {0}" -f $apply.id)

    $screening = Invoke-RestMethod -Uri ("http://localhost:8080/api/applications/" + $apply.id + "/screening") -Method Get -Headers @{ Authorization = "Bearer $seekerToken" }
    Write-Log ("Retrieved screening {0}" -f $screening.id)

    [pscustomobject]@{
        jobId = $job.id
        applicationId = $apply.id
        screeningId = $screening.id
        matchScore = $screening.matchScore
        isEligible = $screening.isEligible
    } | ConvertTo-Json -Depth 6
} catch {
    Write-Log ("ERROR: {0}" -f $_.Exception.Message)
    Write-Log ($_.Exception | Format-List -Force | Out-String)
    throw
}

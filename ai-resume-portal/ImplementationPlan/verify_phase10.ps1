$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$adminEmail = "admin" + $timestamp + "@example.com"
$userEmail = "user" + $timestamp + "@example.com"

$adminRegister = @{ fullName = "Super Admin"; email = $adminEmail; password = "Test@1234"; role = "SUPER_ADMIN" } | ConvertTo-Json
$userRegister = @{ fullName = "Test User"; email = $userEmail; password = "Test@1234"; role = "JOB_SEEKER" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $adminRegister | Out-Null
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $userRegister | Out-Null

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $adminEmail; password = "Test@1234" } | ConvertTo-Json)
$token = $loginResponse.token

$dashboard = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/dashboard" -Method Get -Headers @{ Authorization = "Bearer $token" }
$users = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users" -Method Get -Headers @{ Authorization = "Bearer $token" }
$targetUser = $users | Where-Object { $_.email -eq $userEmail } | Select-Object -First 1
$statusUpdate = Invoke-RestMethod -Uri ("http://localhost:8080/api/admin/users/" + $targetUser.id + "/status") -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body (@{ isActive = $false } | ConvertTo-Json)
$jobs = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/jobs" -Method Get -Headers @{ Authorization = "Bearer $token" }
$applications = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/applications" -Method Get -Headers @{ Authorization = "Bearer $token" }
$screenings = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/screenings" -Method Get -Headers @{ Authorization = "Bearer $token" }

[pscustomobject]@{
    totalUsers = $dashboard.totalUsers
    totalJobs = $dashboard.totalJobs
    totalApplications = $dashboard.totalApplications
    totalScreenings = $dashboard.totalScreenings
    userStatus = $statusUpdate.isActive
    jobsCount = $jobs.Count
    applicationsCount = $applications.Count
    screeningsCount = $screenings.Count
} | ConvertTo-Json -Depth 6

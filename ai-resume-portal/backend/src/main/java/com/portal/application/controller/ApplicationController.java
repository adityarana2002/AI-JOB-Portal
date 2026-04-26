package com.portal.application.controller;

import com.portal.application.dto.ApplicationResponse;
import com.portal.application.dto.EmployerStatsResponse;
import com.portal.application.dto.JobSeekerStatsResponse;
import com.portal.application.dto.ScreeningResultResponse;
import com.portal.application.dto.StatusUpdateRequest;
import com.portal.application.service.ApplicationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping(value = "/{jobId}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponse> apply(
        @PathVariable Long jobId,
        @RequestParam("resume") @NotNull MultipartFile resume,
        @RequestParam(value = "coverLetter", required = false) String coverLetter,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.applyToJob(jobId, resume, coverLetter, authentication));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponse>> myApplications(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getMyApplications(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplication(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.getApplicationById(id, authentication));
    }

    @GetMapping("/{id}/screening")
    public ResponseEntity<ScreeningResultResponse> getScreeningResult(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.getScreeningResult(id, authentication));
    }

    @GetMapping("/employer-stats")
    public ResponseEntity<EmployerStatsResponse> getEmployerStats(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getEmployerStats(authentication));
    }

    @GetMapping("/stats")
    public ResponseEntity<JobSeekerStatsResponse> getJobSeekerStats(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getJobSeekerStats(authentication));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody StatusUpdateRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, request, authentication));
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<java.util.Map<String, Boolean>> checkApplied(
        @PathVariable Long jobId,
        Authentication authentication
    ) {
        boolean applied = applicationService.hasApplied(jobId, authentication);
        return ResponseEntity.ok(java.util.Map.of("applied", applied));
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return applicationService.downloadResume(id, authentication);
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponse> withdraw(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.withdrawApplication(id, authentication));
    }
}

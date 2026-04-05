package com.portal.application.controller;

import com.portal.application.dto.ApplicationResponse;
import com.portal.application.service.ApplicationService;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
}

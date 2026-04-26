package com.portal.job.controller;

import com.portal.application.dto.ApplicationResponse;
import com.portal.application.dto.CandidateRankingResponse;
import com.portal.application.service.ApplicationService;
import com.portal.job.dto.JobRequest;
import com.portal.job.dto.JobResponse;
import com.portal.job.service.JobService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
        @Valid @RequestBody JobRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(jobService.createJob(request, authentication));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getActiveJobs() {
        return ResponseEntity.ok(jobService.getActiveJobs());
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(Authentication authentication) {
        return ResponseEntity.ok(jobService.getMyJobs(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/{id}/applicants")
    public ResponseEntity<List<ApplicationResponse>> getApplicants(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.getApplicantsForJob(id, authentication));
    }

    @GetMapping("/{id}/rankings")
    public ResponseEntity<List<CandidateRankingResponse>> getRankedApplicants(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(applicationService.getRankedApplicantsForJob(id, authentication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
        @PathVariable Long id,
        @Valid @RequestBody JobRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(jobService.updateJob(id, request, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
        @PathVariable Long id,
        Authentication authentication
    ) {
        jobService.deleteJob(id, authentication);
        return ResponseEntity.noContent().build();
    }

    /** Job Seeker: toggle save/unsave a job */
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Map<String, Boolean>> toggleBookmark(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(jobService.toggleBookmark(id, authentication));
    }

    /** Job Seeker: get all saved (bookmarked) jobs */
    @GetMapping("/saved")
    public ResponseEntity<List<JobResponse>> getSavedJobs(Authentication authentication) {
        return ResponseEntity.ok(jobService.getSavedJobs(authentication));
    }

    /** Job Seeker: check if a specific job is bookmarked */
    @GetMapping("/{id}/bookmark")
    public ResponseEntity<Map<String, Boolean>> checkBookmark(
        @PathVariable Long id,
        Authentication authentication
    ) {
        return ResponseEntity.ok(jobService.checkBookmark(id, authentication));
    }
}

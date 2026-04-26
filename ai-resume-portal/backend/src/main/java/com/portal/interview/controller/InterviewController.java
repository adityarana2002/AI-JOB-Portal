package com.portal.interview.controller;

import com.portal.interview.dto.CandidateResponseRequest;
import com.portal.interview.dto.InterviewResponse;
import com.portal.interview.dto.RescheduleInterviewRequest;
import com.portal.interview.dto.ScheduleInterviewRequest;
import com.portal.interview.service.InterviewService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    /** Employer: schedule a new interview for a shortlisted application */
    @PostMapping
    public ResponseEntity<InterviewResponse> schedule(
        @Valid @RequestBody ScheduleInterviewRequest request,
        Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interviewService.scheduleInterview(request, auth));
    }

    /** Both roles: list my interviews (employer → all their interviews, jobseeker → own) */
    @GetMapping
    public ResponseEntity<List<InterviewResponse>> myInterviews(Authentication auth) {
        return ResponseEntity.ok(interviewService.getMyInterviews(auth));
    }

    /** Both roles: get single interview details */
    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponse> getOne(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(interviewService.getInterview(id, auth));
    }

    /** Both roles: get all interviews for a specific application */
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<InterviewResponse>> byApplication(
        @PathVariable Long applicationId,
        Authentication auth
    ) {
        return ResponseEntity.ok(interviewService.getInterviewsForApplication(applicationId, auth));
    }

    /** Employer: reschedule an interview */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<InterviewResponse> reschedule(
        @PathVariable Long id,
        @Valid @RequestBody RescheduleInterviewRequest request,
        Authentication auth
    ) {
        return ResponseEntity.ok(interviewService.rescheduleInterview(id, request, auth));
    }

    /** Candidate: confirm or decline interview */
    @PatchMapping("/{id}/respond")
    public ResponseEntity<InterviewResponse> respond(
        @PathVariable Long id,
        @RequestBody CandidateResponseRequest request,
        Authentication auth
    ) {
        return ResponseEntity.ok(interviewService.respondToInterview(id, request, auth));
    }

    /** Employer: mark interview as completed */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<InterviewResponse> complete(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(interviewService.markCompleted(id, auth));
    }

    /** Either party: cancel interview */
    @DeleteMapping("/{id}")
    public ResponseEntity<InterviewResponse> cancel(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(interviewService.cancelInterview(id, auth));
    }
}

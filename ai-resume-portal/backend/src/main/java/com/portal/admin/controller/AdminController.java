package com.portal.admin.controller;

import com.portal.admin.dto.AdminDashboardResponse;
import com.portal.admin.dto.AdminUserResponse;
import com.portal.admin.dto.ScreeningReportResponse;
import com.portal.admin.dto.UserStatusUpdateRequest;
import com.portal.admin.service.AdminService;
import com.portal.application.dto.ApplicationResponse;
import com.portal.job.dto.JobResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard(Authentication authentication) {
        return ResponseEntity.ok(adminService.getDashboard(authentication));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> users(Authentication authentication) {
        return ResponseEntity.ok(adminService.getUsers(authentication));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UserStatusUpdateRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request, authentication));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> jobs(Authentication authentication) {
        return ResponseEntity.ok(adminService.getJobs(authentication));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> applications(Authentication authentication) {
        return ResponseEntity.ok(adminService.getApplications(authentication));
    }

    @GetMapping("/screenings")
    public ResponseEntity<List<ScreeningReportResponse>> screenings(Authentication authentication) {
        return ResponseEntity.ok(adminService.getScreenings(authentication));
    }
}

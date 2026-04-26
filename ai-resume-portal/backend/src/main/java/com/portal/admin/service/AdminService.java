package com.portal.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.admin.dto.AdminDashboardResponse;
import com.portal.admin.dto.AdminUserResponse;
import com.portal.admin.dto.ScreeningReportResponse;
import com.portal.admin.dto.UserStatusUpdateRequest;
import com.portal.ai.entity.ScreeningResult;
import com.portal.ai.repository.ScreeningResultRepository;
import com.portal.application.dto.ApplicationResponse;
import com.portal.application.repository.ApplicationRepository;
import com.portal.audit.entity.AuditAction;
import com.portal.audit.service.AuditLogService;
import com.portal.job.dto.JobResponse;
import com.portal.job.repository.JobRepository;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ScreeningResultRepository screeningResultRepository;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    public AdminDashboardResponse getDashboard(Authentication authentication) {
        requireSuperAdmin(authentication);
        return new AdminDashboardResponse(
            userRepository.count(),
            jobRepository.count(),
            applicationRepository.count(),
            screeningResultRepository.count()
        );
    }

    public List<AdminUserResponse> getUsers(Authentication authentication) {
        requireSuperAdmin(authentication);
        return userRepository.findAll()
            .stream()
            .map(AdminUserResponse::fromUser)
            .toList();
    }

    public AdminUserResponse updateUserStatus(
        Long userId,
        UserStatusUpdateRequest request,
        Authentication authentication
    ) {
        requireSuperAdmin(authentication);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setIsActive(request.isActive());
        AdminUserResponse response = AdminUserResponse.fromUser(userRepository.save(user));
        User admin = getCurrentUser(authentication);
        auditLogService.log(admin.getId(), admin.getEmail(),
            AuditAction.USER_STATUS_CHANGED, "USER", userId,
            "Set isActive=" + request.isActive() + " for " + user.getEmail());
        return response;
    }

    public List<JobResponse> getJobs(Authentication authentication) {
        requireSuperAdmin(authentication);
        return jobRepository.findAll()
            .stream()
            .map(JobResponse::fromEntity)
            .toList();
    }

    public List<ApplicationResponse> getApplications(Authentication authentication) {
        requireSuperAdmin(authentication);
        return applicationRepository.findAll()
            .stream()
            .map(ApplicationResponse::fromEntity)
            .toList();
    }

    public List<ScreeningReportResponse> getScreenings(Authentication authentication) {
        requireSuperAdmin(authentication);
        return screeningResultRepository.findAll()
            .stream()
            .map(this::toReport)
            .toList();
    }

    private ScreeningReportResponse toReport(ScreeningResult result) {
        ScreeningReportResponse response = new ScreeningReportResponse();
        response.setId(result.getId());
        if (result.getApplication() != null) {
            response.setApplicationId(result.getApplication().getId());
            if (result.getApplication().getJob() != null) {
                response.setJobId(result.getApplication().getJob().getId());
                response.setJobTitle(result.getApplication().getJob().getTitle());
            }
            if (result.getApplication().getApplicant() != null) {
                response.setApplicantId(result.getApplication().getApplicant().getId());
                response.setApplicantName(result.getApplication().getApplicant().getFullName());
            }
        }
        response.setMatchScore(result.getMatchScore());
        response.setIsEligible(result.getIsEligible());
        response.setMatchedSkills(readList(result.getMatchedSkills()));
        response.setMissingSkills(readList(result.getMissingSkills()));
        response.setStrengths(readList(result.getStrengths()));
        response.setWeaknesses(readList(result.getWeaknesses()));
        response.setSummary(result.getSummary());
        response.setCreatedAt(result.getCreatedAt());
        return response;
    }

    private List<String> readList(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse screening data", ex);
        }
    }

    private void requireSuperAdmin(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        }
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}

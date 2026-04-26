package com.portal.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.ai.dto.AiScreeningPayload;
import com.portal.ai.dto.LearningPlanItem;
import com.portal.ai.dto.ScreeningResult;
import com.portal.ai.dto.YoutubeRecommendation;
import com.portal.ai.repository.ScreeningResultRepository;
import com.portal.ai.service.AiScreeningService;
import com.portal.application.dto.ApplicationResponse;
import com.portal.application.dto.CandidateRankingResponse;
import com.portal.application.dto.EmployerStatsResponse;
import com.portal.application.dto.JobSeekerStatsResponse;
import com.portal.application.dto.ScreeningResultResponse;
import com.portal.application.dto.StatusUpdateRequest;
import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import com.portal.application.repository.ApplicationRepository;
import com.portal.audit.entity.AuditAction;
import com.portal.audit.service.AuditLogService;
import com.portal.job.entity.Job;
import com.portal.job.repository.JobRepository;
import com.portal.notification.entity.NotificationType;
import com.portal.notification.service.EmailService;
import com.portal.notification.service.NotificationService;
import com.portal.resume.service.ResumeParsingService;
import com.portal.resume.service.ResumeStorageService;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeStorageService resumeStorageService;
    private final ResumeParsingService resumeParsingService;
    private final AiScreeningService aiScreeningService;
    private final ScreeningResultRepository screeningResultRepository;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Transactional
    public ApplicationResponse applyToJob(
        Long jobId,
        MultipartFile resume,
        String coverLetter,
        Authentication authentication
    ) {
        User applicant = getCurrentUser(authentication);
        requireJobSeeker(applicant);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!Boolean.TRUE.equals(job.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }

        if (applicationRepository.existsByApplicantIdAndJobId(applicant.getId(), jobId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this job");
        }

        String storedPath = resumeStorageService.store(
            resume,
            "resume-job" + jobId + "-user" + applicant.getId()
        );
        String resumeText = resumeParsingService.extractText(Path.of(storedPath));
        if (resumeText == null) {
            resumeText = "";
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setResumePath(storedPath);
        application.setCoverLetter(coverLetter);
        application.setStatus(ApplicationStatus.SCREENING);

        JobApplication saved = applicationRepository.save(application);
        AiScreeningPayload payload;
        try {
            payload = aiScreeningService.runScreening(
                job.getTitle(),
                job.getDescription(),
                job.getRequiredSkills(),
                job.getExperienceRequired(),
                resumeText
            );
        } catch (ResponseStatusException ex) {
            saved.setStatus(ApplicationStatus.PENDING);
            applicationRepository.save(saved);
            throw ex;
        }

        ScreeningResult screening = payload.getScreeningResult();
        com.portal.ai.entity.ScreeningResult entity = new com.portal.ai.entity.ScreeningResult();
        entity.setApplication(saved);
        entity.setMatchScore(screening.getMatchScore());
        entity.setIsEligible(Boolean.TRUE.equals(screening.getIsEligible()));
        entity.setMatchedSkills(writeJson(screening.getMatchedSkills()));
        entity.setMissingSkills(writeJson(screening.getMissingSkills()));
        entity.setStrengths(writeJson(screening.getStrengths()));
        entity.setWeaknesses(writeJson(screening.getWeaknesses()));
        entity.setSummary(screening.getSummary());
        entity.setLearningPlan(writeJson(payload.getLearningPlan()));
        entity.setYoutubeLinks(writeJson(payload.getYoutubeRecommendations()));
        entity.setRawAiResponse(buildRawAiResponse(payload));
        screeningResultRepository.save(entity);

        saved.setStatus(ApplicationStatus.SCREENED);
        applicationRepository.save(saved);
        emailService.sendApplicationConfirmationEmail(saved);
        auditLogService.log(applicant.getId(), applicant.getEmail(),
            AuditAction.APPLICATION_SUBMITTED, "APPLICATION", saved.getId(),
            "Applied to job: " + job.getTitle());
        return ApplicationResponse.fromEntity(saved);
    }

    public List<ApplicationResponse> getMyApplications(Authentication authentication) {
        User applicant = getCurrentUser(authentication);
        requireJobSeeker(applicant);

        return applicationRepository.findByApplicantId(applicant.getId())
            .stream()
            .map(ApplicationResponse::fromEntity)
            .toList();
    }

    public ApplicationResponse getApplicationById(Long id, Authentication authentication) {
        User applicant = getCurrentUser(authentication);
        requireJobSeeker(applicant);

        JobApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (application.getApplicant() == null || !application.getApplicant().getId().equals(applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not application owner");
        }

        return ApplicationResponse.fromEntity(application);
    }

    public List<ApplicationResponse> getApplicantsForJob(Long jobId, Authentication authentication) {
        User user = getCurrentUser(authentication);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        if (user.getRole() == Role.EMPLOYER) {
            if (job.getEmployer() == null || !job.getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return applicationRepository.findByJobId(jobId)
            .stream()
            .map(ApplicationResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidateRankingResponse> getRankedApplicantsForJob(Long jobId, Authentication authentication) {
        User user = getCurrentUser(authentication);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        if (user.getRole() == Role.EMPLOYER) {
            if (job.getEmployer() == null || !job.getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        List<JobApplication> applications = applicationRepository.findByJobId(jobId);
        List<com.portal.ai.entity.ScreeningResult> screeningResults = screeningResultRepository.findByApplicationJobId(jobId);

        Map<Long, com.portal.ai.entity.ScreeningResult> screeningByApplicationId = new HashMap<>();
        for (com.portal.ai.entity.ScreeningResult screeningResult : screeningResults) {
            if (screeningResult.getApplication() != null && screeningResult.getApplication().getId() != null) {
                screeningByApplicationId.putIfAbsent(screeningResult.getApplication().getId(), screeningResult);
            }
        }

        return applications.stream()
            .map(application -> CandidateRankingResponse.fromEntities(
                application,
                screeningByApplicationId.get(application.getId())
            ))
            .sorted(
                Comparator
                    .comparing(
                        CandidateRankingResponse::getMatchScore,
                        Comparator.nullsLast(Comparator.reverseOrder())
                    )
                    .thenComparing(
                        CandidateRankingResponse::getStatus,
                        Comparator.comparingInt(this::statusPriority).reversed()
                    )
                    .thenComparing(
                        CandidateRankingResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                    )
            )
            .toList();
    }

    @Transactional(readOnly = true)
    public ScreeningResultResponse getScreeningResult(Long applicationId, Authentication authentication) {
        User user = getCurrentUser(authentication);

        JobApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (user.getRole() == Role.JOB_SEEKER) {
            if (application.getApplicant() == null
                || !application.getApplicant().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not application owner");
            }
        } else if (user.getRole() == Role.EMPLOYER) {
            if (application.getJob() == null
                || application.getJob().getEmployer() == null
                || !application.getJob().getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        com.portal.ai.entity.ScreeningResult result = screeningResultRepository
            .findByApplicationId(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Screening result not found"));

        ScreeningResultResponse response = new ScreeningResultResponse();
        response.setId(result.getId());
        response.setApplicationId(applicationId);
        if (result.getApplication() != null && result.getApplication().getJob() != null) {
            response.setJobId(result.getApplication().getJob().getId());
        }
        response.setMatchScore(result.getMatchScore());
        response.setIsEligible(result.getIsEligible());
        response.setMatchedSkills(readList(result.getMatchedSkills(), new TypeReference<List<String>>() {}));
        response.setMissingSkills(readList(result.getMissingSkills(), new TypeReference<List<String>>() {}));
        response.setStrengths(readList(result.getStrengths(), new TypeReference<List<String>>() {}));
        response.setWeaknesses(readList(result.getWeaknesses(), new TypeReference<List<String>>() {}));
        response.setSummary(result.getSummary());
        response.setLearningPlan(readList(result.getLearningPlan(), new TypeReference<List<LearningPlanItem>>() {}));
        response.setYoutubeRecommendations(
            readList(result.getYoutubeLinks(), new TypeReference<List<YoutubeRecommendation>>() {})
        );
        response.setCreatedAt(result.getCreatedAt());
        return response;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireJobSeeker(User user) {
        if (user.getRole() != Role.JOB_SEEKER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Job seeker access required");
        }
    }

    private String writeJson(Object value) {
        if (value == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize screening data", ex);
        }
    }

    private String buildRawAiResponse(AiScreeningPayload payload) {
        Map<String, String> raw = new LinkedHashMap<>();
        raw.put("screeningRaw", payload.getScreeningRaw());
        raw.put("learningPlanRaw", payload.getLearningPlanRaw());
        raw.put("youtubeRaw", payload.getYoutubeRaw());
        try {
            return objectMapper.writeValueAsString(raw);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize AI raw response", ex);
        }
    }

    private <T> List<T> readList(String json, TypeReference<List<T>> typeReference) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse screening data", ex);
        }
    }

    public EmployerStatsResponse getEmployerStats(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user.getRole() != Role.EMPLOYER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employer access required");
        }
        long activeJobs = jobRepository.countByEmployerIdAndIsActiveTrue(user.getId());
        long totalApplications = applicationRepository.countByJobEmployerId(user.getId());
        long shortlistedCount = applicationRepository.countByJobEmployerIdAndStatus(user.getId(), ApplicationStatus.SHORTLISTED);
        Double avgScore = screeningResultRepository.avgMatchScoreByEmployerId(user.getId());
        return new EmployerStatsResponse(activeJobs, totalApplications, shortlistedCount,
            avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0);
    }

    public JobSeekerStatsResponse getJobSeekerStats(Authentication authentication) {
        User user = getCurrentUser(authentication);
        requireJobSeeker(user);
        long total = applicationRepository.countByApplicantId(user.getId());
        long highMatch = screeningResultRepository.countHighMatchByApplicantId(user.getId(), 70);
        long shortlisted = applicationRepository.countByApplicantIdAndStatus(user.getId(), ApplicationStatus.SHORTLISTED);
        long pending = applicationRepository.countByApplicantIdAndStatus(user.getId(), ApplicationStatus.PENDING);
        return new JobSeekerStatsResponse(total, highMatch, shortlisted, pending);
    }

    public boolean hasApplied(Long jobId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        requireJobSeeker(user);
        return applicationRepository.existsByApplicantIdAndJobId(user.getId(), jobId);
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(
        Long applicationId,
        StatusUpdateRequest request,
        Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        JobApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (request.getStatus() != ApplicationStatus.SHORTLISTED
            && request.getStatus() != ApplicationStatus.REJECTED
            && request.getStatus() != ApplicationStatus.SCREENED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only SHORTLISTED, REJECTED, or SCREENED status transitions are permitted");
        }
        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a withdrawn application");
        }
        if (user.getRole() == Role.EMPLOYER) {
            if (application.getJob() == null
                || application.getJob().getEmployer() == null
                || !application.getJob().getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(request.getStatus());
        ApplicationResponse saved = ApplicationResponse.fromEntity(applicationRepository.save(application));

        // Notify applicant of status change
        String jobTitle = application.getJob().getTitle();
        String statusMsg = switch (request.getStatus()) {
            case SHORTLISTED -> "Congratulations! You have been shortlisted for " + jobTitle + ". Expect an interview invitation soon.";
            case REJECTED -> "Your application for " + jobTitle + " was not selected to move forward. Keep applying!";
            case SCREENED -> "Your application for " + jobTitle + " has been reviewed by AI screening.";
            default -> "Your application status for " + jobTitle + " has been updated to " + request.getStatus() + ".";
        };
        notificationService.send(
            application.getApplicant(),
            NotificationType.APPLICATION_STATUS_CHANGED,
            "Application Update: " + jobTitle,
            statusMsg,
            application.getId(), "APPLICATION"
        );
        emailService.sendApplicationStatusEmail(application);
        auditLogService.log(user.getId(), user.getEmail(),
            AuditAction.APPLICATION_STATUS_CHANGED, "APPLICATION", applicationId,
            previousStatus + " -> " + request.getStatus() + " for " + jobTitle);
        return saved;
    }

    @Transactional
    public ApplicationResponse withdrawApplication(Long applicationId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        requireJobSeeker(user);

        JobApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (application.getApplicant() == null || !application.getApplicant().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not application owner");
        }

        if (application.getStatus() != ApplicationStatus.PENDING
            && application.getStatus() != ApplicationStatus.SCREENED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Can only withdraw PENDING or SCREENED applications");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        ApplicationResponse saved = ApplicationResponse.fromEntity(applicationRepository.save(application));

        String jobTitle = application.getJob().getTitle();
        emailService.sendApplicationWithdrawnEmail(application);
        auditLogService.log(user.getId(), user.getEmail(),
            AuditAction.APPLICATION_WITHDRAWN, "APPLICATION", applicationId,
            "Withdrew from: " + jobTitle);
        return saved;
    }

    private int statusPriority(ApplicationStatus status) {
        if (status == null) {
            return 0;
        }

        return switch (status) {
            case SHORTLISTED -> 5;
            case SCREENED -> 4;
            case SCREENING -> 3;
            case PENDING -> 2;
            case REJECTED -> 1;
            case WITHDRAWN -> 0;
        };
    }

    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadResume(
        Long applicationId,
        Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        JobApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (user.getRole() == Role.JOB_SEEKER) {
            if (application.getApplicant() == null
                || !application.getApplicant().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not application owner");
            }
        } else if (user.getRole() == Role.EMPLOYER) {
            if (application.getJob() == null
                || application.getJob().getEmployer() == null
                || !application.getJob().getEmployer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
            }
        } else if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (application.getResumePath() == null || application.getResumePath().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No resume on file");
        }

        java.nio.file.Path filePath = java.nio.file.Path.of(application.getResumePath());
        if (!java.nio.file.Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume file not found on disk");
        }

        org.springframework.core.io.Resource resource =
            new org.springframework.core.io.FileSystemResource(filePath);

        String contentType;
        try {
            contentType = java.nio.file.Files.probeContentType(filePath);
        } catch (java.io.IOException ex) {
            contentType = null;
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        String filename = filePath.getFileName().toString();
        return org.springframework.http.ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
            .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" + filename + "\"")
            .body(resource);
    }
}

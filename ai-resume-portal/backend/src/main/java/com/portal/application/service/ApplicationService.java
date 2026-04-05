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
import com.portal.application.dto.ScreeningResultResponse;
import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import com.portal.application.repository.ApplicationRepository;
import com.portal.job.entity.Job;
import com.portal.job.repository.JobRepository;
import com.portal.resume.service.ResumeParsingService;
import com.portal.resume.service.ResumeStorageService;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.nio.file.Path;
import java.util.Collections;
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
}

package com.portal.application.service;

import com.portal.application.dto.ApplicationResponse;
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
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
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
        resumeParsingService.extractText(Path.of(storedPath));

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setResumePath(storedPath);
        application.setCoverLetter(coverLetter);
        application.setStatus(ApplicationStatus.PENDING);

        JobApplication saved = applicationRepository.save(application);
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
}

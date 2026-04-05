package com.portal.job.service;

import com.portal.job.dto.JobRequest;
import com.portal.job.dto.JobResponse;
import com.portal.job.entity.Job;
import com.portal.job.repository.JobRepository;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobResponse createJob(JobRequest request, Authentication authentication) {
        User employer = getCurrentUser(authentication);
        requireEmployer(employer);

        Job job = new Job();
        job.setEmployer(employer);
        applyRequest(job, request);

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    public List<JobResponse> getActiveJobs() {
        return jobRepository.findByIsActiveTrue()
            .stream()
            .map(JobResponse::fromEntity)
            .toList();
    }

    public JobResponse getJobById(Long id) {
        Job job = getJobOrThrow(id);
        if (!Boolean.TRUE.equals(job.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        return JobResponse.fromEntity(job);
    }

    public JobResponse updateJob(Long id, JobRequest request, Authentication authentication) {
        User employer = getCurrentUser(authentication);
        requireEmployer(employer);

        Job job = getJobOrThrow(id);
        verifyOwner(job, employer);
        if (!Boolean.TRUE.equals(job.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }

        applyRequest(job, request);
        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    public void deleteJob(Long id, Authentication authentication) {
        User employer = getCurrentUser(authentication);
        requireEmployer(employer);

        Job job = getJobOrThrow(id);
        verifyOwner(job, employer);

        job.setIsActive(false);
        jobRepository.save(job);
    }

    public List<JobResponse> getMyJobs(Authentication authentication) {
        User employer = getCurrentUser(authentication);
        requireEmployer(employer);

        return jobRepository.findByEmployerId(employer.getId())
            .stream()
            .map(JobResponse::fromEntity)
            .toList();
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireEmployer(User user) {
        if (user.getRole() != Role.EMPLOYER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employer access required");
        }
    }

    private Job getJobOrThrow(Long id) {
        return jobRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    private void verifyOwner(Job job, User employer) {
        if (job.getEmployer() == null || !job.getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not job owner");
        }
    }

    private void applyRequest(Job job, JobRequest request) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType());
        job.setDeadline(request.getDeadline());
    }
}

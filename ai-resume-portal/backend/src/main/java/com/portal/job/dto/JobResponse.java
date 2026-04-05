package com.portal.job.dto;

import com.portal.job.entity.Job;
import com.portal.job.entity.JobType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String requiredSkills;
    private String experienceRequired;
    private String salaryRange;
    private String location;
    private JobType jobType;
    private Boolean isActive;
    private LocalDate deadline;
    private Long employerId;
    private String employerName;
    private String employerCompany;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static JobResponse fromEntity(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setRequiredSkills(job.getRequiredSkills());
        response.setExperienceRequired(job.getExperienceRequired());
        response.setSalaryRange(job.getSalaryRange());
        response.setLocation(job.getLocation());
        response.setJobType(job.getJobType());
        response.setIsActive(job.getIsActive());
        response.setDeadline(job.getDeadline());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        if (job.getEmployer() != null) {
            response.setEmployerId(job.getEmployer().getId());
            response.setEmployerName(job.getEmployer().getFullName());
            response.setEmployerCompany(job.getEmployer().getCompanyName());
        }
        return response;
    }
}

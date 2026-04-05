package com.portal.application.dto;

import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long applicantId;
    private ApplicationStatus status;
    private String resumePath;
    private String coverLetter;
    private LocalDateTime createdAt;

    public static ApplicationResponse fromEntity(JobApplication application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        if (application.getJob() != null) {
            response.setJobId(application.getJob().getId());
            response.setJobTitle(application.getJob().getTitle());
        }
        if (application.getApplicant() != null) {
            response.setApplicantId(application.getApplicant().getId());
        }
        response.setStatus(application.getStatus());
        response.setResumePath(application.getResumePath());
        response.setCoverLetter(application.getCoverLetter());
        response.setCreatedAt(application.getCreatedAt());
        return response;
    }
}

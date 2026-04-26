package com.portal.interview.dto;

import com.portal.interview.entity.Interview;
import com.portal.interview.entity.InterviewStatus;
import com.portal.interview.entity.InterviewType;
import java.time.LocalDateTime;

public record InterviewResponse(
    Long id,
    Long applicationId,
    Long jobId,
    String jobTitle,
    String companyName,
    Long employerId,
    String employerName,
    String employerEmail,
    Long applicantId,
    String applicantName,
    String applicantEmail,
    LocalDateTime scheduledAt,
    String meetingLink,
    InterviewType interviewType,
    Integer durationMinutes,
    String message,
    InterviewStatus status,
    String candidateNote,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static InterviewResponse from(Interview i) {
        return new InterviewResponse(
            i.getId(),
            i.getApplication().getId(),
            i.getApplication().getJob().getId(),
            i.getApplication().getJob().getTitle(),
            i.getApplication().getJob().getEmployer().getCompanyName() != null
                ? i.getApplication().getJob().getEmployer().getCompanyName()
                : i.getApplication().getJob().getEmployer().getFullName(),
            i.getEmployer().getId(),
            i.getEmployer().getFullName(),
            i.getEmployer().getEmail(),
            i.getApplicant().getId(),
            i.getApplicant().getFullName(),
            i.getApplicant().getEmail(),
            i.getScheduledAt(),
            i.getMeetingLink(),
            i.getInterviewType(),
            i.getDurationMinutes(),
            i.getMessage(),
            i.getStatus(),
            i.getCandidateNote(),
            i.getCreatedAt(),
            i.getUpdatedAt()
        );
    }
}

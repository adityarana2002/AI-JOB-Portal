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
public class CandidateRankingResponse {

    private Long applicationId;
    private Long jobId;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private ApplicationStatus status;
    private Integer matchScore;
    private String rankingReason;
    private String coverLetter;
    private LocalDateTime createdAt;

    public static CandidateRankingResponse fromEntities(
        JobApplication application,
        com.portal.ai.entity.ScreeningResult screeningResult
    ) {
        CandidateRankingResponse response = new CandidateRankingResponse();
        response.setApplicationId(application.getId());

        if (application.getJob() != null) {
            response.setJobId(application.getJob().getId());
        }

        if (application.getApplicant() != null) {
            response.setApplicantId(application.getApplicant().getId());
            response.setApplicantName(application.getApplicant().getFullName());
            response.setApplicantEmail(application.getApplicant().getEmail());
        }

        response.setStatus(application.getStatus());
        response.setCreatedAt(application.getCreatedAt());
        response.setCoverLetter(application.getCoverLetter());

        Integer score = screeningResult != null ? screeningResult.getMatchScore() : null;
        response.setMatchScore(score);
        response.setRankingReason(buildRankingReason(score, application.getStatus()));
        return response;
    }

    private static String buildRankingReason(Integer score, ApplicationStatus status) {
        String scoreText = score != null ? String.valueOf(score) : "Pending";
        String statusText = status != null ? status.name() : "UNKNOWN";
        return "Score " + scoreText + ", status " + statusText;
    }
}
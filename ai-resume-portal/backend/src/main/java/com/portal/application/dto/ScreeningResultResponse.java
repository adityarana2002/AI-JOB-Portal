package com.portal.application.dto;

import com.portal.ai.dto.LearningPlanItem;
import com.portal.ai.dto.YoutubeRecommendation;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningResultResponse {

    private Long id;
    private Long applicationId;
    private Long jobId;
    private Integer matchScore;
    private Boolean isEligible;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> strengths;
    private List<String> weaknesses;
    private String summary;
    private List<LearningPlanItem> learningPlan;
    private List<YoutubeRecommendation> youtubeRecommendations;
    private LocalDateTime createdAt;
}

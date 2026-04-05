package com.portal.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTestResponse {

    private ScreeningResult screeningResult;
    private List<LearningPlanItem> learningPlan;
    private List<YoutubeRecommendation> youtubeRecommendations;
}

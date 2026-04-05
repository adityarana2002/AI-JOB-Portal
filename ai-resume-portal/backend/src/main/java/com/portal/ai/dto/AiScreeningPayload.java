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
public class AiScreeningPayload {

    private ScreeningResult screeningResult;
    private List<LearningPlanItem> learningPlan;
    private List<YoutubeRecommendation> youtubeRecommendations;
    private String screeningRaw;
    private String learningPlanRaw;
    private String youtubeRaw;
}

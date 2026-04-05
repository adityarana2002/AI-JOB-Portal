package com.portal.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.ai.dto.AiScreeningPayload;
import com.portal.ai.dto.AiTestRequest;
import com.portal.ai.dto.AiTestResponse;
import com.portal.ai.dto.LearningPlanItem;
import com.portal.ai.dto.ScreeningResult;
import com.portal.ai.dto.YoutubeRecommendation;
import com.portal.ai.prompt.PromptTemplates;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AiScreeningService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AiTestResponse runTest(AiTestRequest request) {
        AiScreeningPayload payload = runScreening(
            request.getJobTitle(),
            request.getJobDescription(),
            request.getRequiredSkills(),
            request.getExperienceRequired(),
            request.getResumeText()
        );
        return new AiTestResponse(
            payload.getScreeningResult(),
            payload.getLearningPlan(),
            payload.getYoutubeRecommendations()
        );
    }

    public AiScreeningPayload runScreening(
        String jobTitle,
        String jobDescription,
        String requiredSkills,
        String experienceRequired,
        String resumeText
    ) {
        String screeningPrompt = PromptTemplates.buildScreeningPrompt(
            jobTitle,
            jobDescription,
            requiredSkills,
            experienceRequired,
            resumeText
        );
        String screeningRaw = callModel(screeningPrompt);
        String screeningJson = extractJson(screeningRaw);
        ScreeningResult screening = parseJson(screeningJson, ScreeningResult.class);

        List<LearningPlanItem> learningPlan = Collections.emptyList();
        List<YoutubeRecommendation> youtubeRecommendations = Collections.emptyList();
        String learningPlanRaw = null;
        String youtubeRaw = null;

        if (Boolean.FALSE.equals(screening.getIsEligible())) {
            String learningPrompt = PromptTemplates.buildLearningPlanPrompt(
                screening.getMissingSkills(),
                jobTitle
            );
            learningPlanRaw = callModel(learningPrompt);
            String learningJson = extractJson(learningPlanRaw);
            learningPlan = parseJson(learningJson, new TypeReference<List<LearningPlanItem>>() {});

            String youtubePrompt = PromptTemplates.buildYoutubePrompt(screening.getMissingSkills());
            youtubeRaw = callModel(youtubePrompt);
            String youtubeJson = extractJson(youtubeRaw);
            youtubeRecommendations = parseJson(
                youtubeJson,
                new TypeReference<List<YoutubeRecommendation>>() {}
            );
        }

        return new AiScreeningPayload(
            screening,
            learningPlan,
            youtubeRecommendations,
            screeningRaw,
            learningPlanRaw,
            youtubeRaw
        );
    }

    public ScreeningResult screenResume(AiTestRequest request) {
        return runScreening(
            request.getJobTitle(),
            request.getJobDescription(),
            request.getRequiredSkills(),
            request.getExperienceRequired(),
            request.getResumeText()
        ).getScreeningResult();
    }

    public List<LearningPlanItem> generateLearningPlan(List<String> missingSkills, String jobTitle) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return Collections.emptyList();
        }
        String prompt = PromptTemplates.buildLearningPlanPrompt(missingSkills, jobTitle);
        String raw = callModel(prompt);
        String json = extractJson(raw);
        return parseJson(json, new TypeReference<List<LearningPlanItem>>() {});
    }

    public List<YoutubeRecommendation> generateYoutubeRecommendations(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return Collections.emptyList();
        }
        String prompt = PromptTemplates.buildYoutubePrompt(missingSkills);
        String raw = callModel(prompt);
        String json = extractJson(raw);
        return parseJson(json, new TypeReference<List<YoutubeRecommendation>>() {});
    }

    private String callModel(String prompt) {
        try {
            return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable", ex);
        }
    }

    private String extractJson(String raw) {
        if (raw == null) {
            return "";
        }
        String cleaned = raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        int objIndex = cleaned.indexOf('{');
        int arrIndex = cleaned.indexOf('[');
        int start = objIndex == -1 ? arrIndex : arrIndex == -1 ? objIndex : Math.min(objIndex, arrIndex);
        int endObj = cleaned.lastIndexOf('}');
        int endArr = cleaned.lastIndexOf(']');
        int end = Math.max(endObj, endArr);
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        return cleaned.trim();
    }

    private <T> T parseJson(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse AI response", ex);
        }
    }

    private <T> T parseJson(String json, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse AI response", ex);
        }
    }
}

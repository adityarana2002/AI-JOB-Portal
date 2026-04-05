package com.portal.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        ScreeningResult screening = screenResume(request);
        List<LearningPlanItem> learningPlan = Collections.emptyList();
        List<YoutubeRecommendation> youtubeRecommendations = Collections.emptyList();

        if (Boolean.FALSE.equals(screening.getIsEligible())) {
            learningPlan = generateLearningPlan(screening.getMissingSkills(), request.getJobTitle());
            youtubeRecommendations = generateYoutubeRecommendations(screening.getMissingSkills());
        }

        return new AiTestResponse(screening, learningPlan, youtubeRecommendations);
    }

    public ScreeningResult screenResume(AiTestRequest request) {
        String prompt = PromptTemplates.buildScreeningPrompt(
            request.getJobTitle(),
            request.getJobDescription(),
            request.getRequiredSkills(),
            request.getExperienceRequired(),
            request.getResumeText()
        );
        String raw = callModel(prompt);
        String json = extractJson(raw);
        return parseJson(json, ScreeningResult.class);
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

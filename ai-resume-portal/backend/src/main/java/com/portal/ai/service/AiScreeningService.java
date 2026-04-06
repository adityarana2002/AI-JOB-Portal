package com.portal.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.ai.dto.AiScreeningPayload;
import com.portal.ai.dto.AiTestRequest;
import com.portal.ai.dto.AiTestResponse;
import com.portal.ai.dto.LearningPlanItem;
import com.portal.ai.dto.ScreeningResult;
import com.portal.ai.dto.YoutubeRecommendation;
import com.portal.ai.prompt.PromptTemplates;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AiScreeningService {

    private static final int ERROR_PREVIEW_LENGTH = 220;

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
        ScreeningResult screening = parseResponse(screeningRaw, ScreeningResult.class, "screening");

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
            learningPlan = parseResponse(
                learningPlanRaw,
                new TypeReference<List<LearningPlanItem>>() {},
                "learning plan"
            );

            String youtubePrompt = PromptTemplates.buildYoutubePrompt(screening.getMissingSkills());
            youtubeRaw = callModel(youtubePrompt);
            youtubeRecommendations = parseJson(
                extractJson(youtubeRaw),
                youtubeRaw,
                new TypeReference<List<YoutubeRecommendation>>() {},
                "youtube recommendations"
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
        return parseResponse(raw, new TypeReference<List<LearningPlanItem>>() {}, "learning plan");
    }

    public List<YoutubeRecommendation> generateYoutubeRecommendations(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return Collections.emptyList();
        }
        String prompt = PromptTemplates.buildYoutubePrompt(missingSkills);
        String raw = callModel(prompt);
        return parseResponse(raw, new TypeReference<List<YoutubeRecommendation>>() {}, "youtube recommendations");
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
        if (raw == null || raw.isBlank()) {
            return "";
        }

        String cleaned = sanitizeRaw(raw);
        List<String> objectCandidates = extractBalancedSegments(cleaned, '{', '}');
        if (!objectCandidates.isEmpty()) {
            return objectCandidates.get(0);
        }

        List<String> arrayCandidates = extractBalancedSegments(cleaned, '[', ']');
        if (!arrayCandidates.isEmpty()) {
            return arrayCandidates.get(0);
        }

        return cleaned.trim();
    }

    private <T> T parseResponse(String raw, Class<T> type, String stage) {
        return parseJson(extractJson(raw), raw, type, stage);
    }

    private <T> T parseResponse(String raw, TypeReference<T> typeReference, String stage) {
        return parseJson(extractJson(raw), raw, typeReference, stage);
    }

    private <T> T parseJson(String json, String raw, Class<T> type, String stage) {
        Exception lastError = null;
        for (String candidate : buildParseCandidates(json)) {
            try {
                return lenientMapper().readValue(candidate, type);
            } catch (Exception ex) {
                lastError = ex;
            }
        }

        throw parseFailure(stage, raw, lastError);
    }

    private <T> T parseJson(String json, String raw, TypeReference<T> typeReference, String stage) {
        Exception lastError = null;
        for (String candidate : buildParseCandidates(json)) {
            try {
                return lenientMapper().readValue(candidate, typeReference);
            } catch (Exception ex) {
                lastError = ex;
            }
        }

        throw parseFailure(stage, raw, lastError);
    }

    private ObjectMapper lenientMapper() {
        return objectMapper.copy()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    private List<String> buildParseCandidates(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }

        Set<String> candidates = new LinkedHashSet<>();
        String base = json.trim();
        String sanitized = sanitizeJson(base);

        addIfNonBlank(candidates, base);
        addIfNonBlank(candidates, sanitized);

        for (String candidate : extractBalancedSegments(base, '{', '}')) {
            addIfNonBlank(candidates, candidate);
            addEmbeddedArrayCandidates(candidates, candidate);
        }

        for (String candidate : extractBalancedSegments(base, '[', ']')) {
            addIfNonBlank(candidates, candidate);
        }

        for (String candidate : extractBalancedSegments(sanitized, '{', '}')) {
            addIfNonBlank(candidates, candidate);
            addEmbeddedArrayCandidates(candidates, candidate);
        }

        for (String candidate : extractBalancedSegments(sanitized, '[', ']')) {
            addIfNonBlank(candidates, candidate);
        }

        return new ArrayList<>(candidates);
    }

    private void addEmbeddedArrayCandidates(Set<String> candidates, String objectJson) {
        try {
            JsonNode root = lenientMapper().readTree(objectJson);
            if (root == null || !root.isObject()) {
                return;
            }

            root.fields().forEachRemaining(entry -> {
                if (entry.getValue() != null && entry.getValue().isArray()) {
                    addIfNonBlank(candidates, entry.getValue().toString());
                }
            });
        } catch (Exception ignored) {
            // Best effort only; parse candidates are already available.
        }
    }

    private void addIfNonBlank(Set<String> candidates, String value) {
        if (value != null) {
            String trimmed = value.trim();
            if (!trimmed.isEmpty()) {
                candidates.add(trimmed);
            }
        }
    }

    private String sanitizeRaw(String raw) {
        return raw
            .replace("```json", "")
            .replace("```", "")
            .replace('\u201c', '"')
            .replace('\u201d', '"')
            .replace('\u2018', '\'')
            .replace('\u2019', '\'');
    }

    private String sanitizeJson(String json) {
        String cleaned = sanitizeRaw(json).trim();
        return cleaned.replaceAll(",\\s*([}\\]])", "$1");
    }

    private List<String> extractBalancedSegments(String text, char open, char close) {
        List<String> segments = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return segments;
        }

        int depth = 0;
        int start = -1;
        boolean inString = false;
        boolean escaped = false;

        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (ch == '\\') {
                escaped = true;
                continue;
            }

            if (ch == '"') {
                inString = !inString;
                continue;
            }

            if (inString) {
                continue;
            }

            if (ch == open) {
                if (depth == 0) {
                    start = i;
                }
                depth++;
            } else if (ch == close && depth > 0) {
                depth--;
                if (depth == 0 && start >= 0) {
                    segments.add(text.substring(start, i + 1));
                    start = -1;
                }
            }
        }

        return segments;
    }

    private ResponseStatusException parseFailure(String stage, String raw, Exception ex) {
        String preview = raw == null
            ? "(empty AI output)"
            : raw.replaceAll("\\s+", " ").trim();
        if (preview.length() > ERROR_PREVIEW_LENGTH) {
            preview = preview.substring(0, ERROR_PREVIEW_LENGTH) + "...";
        }

        String detail = ex == null ? "unknown parse error" : ex.getMessage();
        String message = "Failed to parse AI response for " + stage + ". Cause: " + detail + ". Raw preview: " + preview;
        return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, message, ex);
    }
}

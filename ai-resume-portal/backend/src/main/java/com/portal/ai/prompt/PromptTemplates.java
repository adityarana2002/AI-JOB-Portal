package com.portal.ai.prompt;

import java.util.List;
import java.util.StringJoiner;

public final class PromptTemplates {

    private PromptTemplates() {
    }

    public static String buildScreeningPrompt(
        String jobTitle,
        String jobDescription,
        String requiredSkills,
        String experienceRequired,
        String resumeText
    ) {
        return String.join("\n",
            "You are a resume screening system. Analyze the resume against the job and return ONLY valid JSON.",
            "",
            "JOB:",
            "- Title: " + safe(jobTitle),
            "- Description: " + safe(jobDescription),
            "- Required Skills: " + safe(requiredSkills),
            "- Experience: " + safe(experienceRequired),
            "",
            "RESUME:",
            safe(resumeText),
            "",
            "Return ONLY this JSON (no markdown, no explanation):",
            "{\"candidateName\": \"string\", \"matchScore\": 0, \"isEligible\": false, \"matchedSkills\": [\"string\"], \"missingSkills\": [\"string\"], \"strengths\": [\"string\", \"string\", \"string\"], \"weaknesses\": [\"string\", \"string\", \"string\"], \"summary\": \"string\"}",
            "",
            "Rules:",
            "- matchScore: 0-100 integer. Scoring: skills=40%, experience=30%, education=15%, fit=15%",
            "- isEligible: true if matchScore >= 60",
            "- matchedSkills: skills from required list found in resume",
            "- missingSkills: skills from required list NOT found in resume",
            "- strengths: exactly 3 specific points with evidence",
            "- weaknesses: exactly 3 specific gaps",
            "- summary: 2-3 sentence assessment",
            "- Output must be valid parseable JSON only"
        );
    }

    public static String buildLearningPlanPrompt(List<String> missingSkills, String jobTitle) {
        return String.join("\n",
            "You are a learning advisor. Create a 7-day study plan for a job candidate who is missing these skills: "
                + joinSkills(missingSkills),
            "",
            "The target job is: " + safe(jobTitle),
            "",
            "Return ONLY this JSON array (no markdown, no explanation):",
            "[{\"day\": \"Day 1\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 3, \"priority\": \"HIGH\"}, {\"day\": \"Day 2\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 3, \"priority\": \"HIGH\"}, {\"day\": \"Day 3\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 2, \"priority\": \"MEDIUM\"}, {\"day\": \"Day 4\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 2, \"priority\": \"MEDIUM\"}, {\"day\": \"Day 5\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 2, \"priority\": \"MEDIUM\"}, {\"day\": \"Day 6\", \"topic\": \"string\", \"tasks\": [\"string\", \"string\"], \"hours\": 3, \"priority\": \"HIGH\"}, {\"day\": \"Day 7\", \"topic\": \"Review and Practice\", \"tasks\": [\"Review all topics\", \"Build mini-project\"], \"hours\": 4, \"priority\": \"HIGH\"}]",
            "",
            "Rules:",
            "- Each day focuses on ONE missing skill or concept",
            "- tasks: 2-3 actionable learning tasks per day",
            "- hours: realistic hours (2-4)",
            "- priority: HIGH for critical skills, MEDIUM for nice-to-have",
            "- Output must be valid parseable JSON array only"
        );
    }

    public static String buildYoutubePrompt(List<String> missingSkills) {
        return String.join("\n",
            "You are a learning resource advisor. For each missing skill below, suggest ONE popular YouTube channel and a search query to learn it.",
            "",
            "Missing Skills: " + joinSkills(missingSkills),
            "",
            "Return ONLY this JSON array (no markdown, no explanation):",
            "[{\"skill\": \"string\", \"channelName\": \"string\", \"searchQuery\": \"string\", \"reason\": \"string\"}]",
            "",
            "Use ONLY well-known channels like: freeCodeCamp, Traversy Media, Programming with Mosh, The Net Ninja, Fireship, Telusko, CodeWithHarry, Apna College, Tech With Tim, Corey Schafer.",
            "",
            "Rules:",
            "- One entry per missing skill",
            "- searchQuery: exact text to paste into YouTube search bar",
            "- reason: one sentence why this channel is good for this skill",
            "- Output must be valid parseable JSON array only"
        );
    }

    private static String joinSkills(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return "(none)";
        }
        StringJoiner joiner = new StringJoiner(", ");
        for (String skill : missingSkills) {
            joiner.add(skill);
        }
        return joiner.toString();
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}

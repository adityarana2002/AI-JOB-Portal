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
            "SYSTEM: You are an automated resume screening API. You must output ONLY a single JSON object.",
            "Do NOT write any explanation, greeting, note, or markdown. Start your response with { and end with }.",
            "",
            "=== JOB DETAILS ===",
            "Title: " + safe(jobTitle),
            "Description: " + safe(jobDescription),
            "Required Skills: " + safe(requiredSkills),
            "Experience Required: " + safe(experienceRequired),
            "",
            "=== CANDIDATE RESUME ===",
            safe(resumeText),
            "",
            "=== OUTPUT FORMAT ===",
            "Output exactly this JSON structure with real values filled in (do not output field names as values):",
            "{",
            "  \"candidateName\": \"John Smith\",",
            "  \"matchScore\": 72,",
            "  \"isEligible\": true,",
            "  \"matchedSkills\": [\"Java\", \"Spring Boot\"],",
            "  \"missingSkills\": [\"Docker\", \"Kubernetes\"],",
            "  \"strengths\": [",
            "    \"3 years of Java experience demonstrated in resume\",",
            "    \"Built REST APIs with Spring Boot in past role\",",
            "    \"Strong problem-solving background shown in projects\"",
            "  ],",
            "  \"weaknesses\": [",
            "    \"No Docker or containerization experience\",",
            "    \"Missing cloud deployment knowledge\",",
            "    \"No microservices architecture experience\"",
            "  ],",
            "  \"summary\": \"The candidate has strong Java and Spring Boot skills matching the core requirements. However, they lack containerization and cloud experience which are needed for this role.\"",
            "}",
            "",
            "=== SCORING RULES ===",
            "matchScore must be an integer 0-100 calculated as: skills match 40% + experience match 30% + education 15% + overall fit 15%",
            "isEligible must be true if matchScore >= 60, false if matchScore < 60",
            "matchedSkills: list ONLY skills from Required Skills that appear in the resume",
            "missingSkills: list ONLY skills from Required Skills that do NOT appear in the resume",
            "strengths: exactly 3 items, each must cite specific evidence from the resume",
            "weaknesses: exactly 3 items, each must name a specific gap or missing skill",
            "summary: exactly 2-3 sentences, must be factual assessment based on the resume",
            "",
            "IMPORTANT: Output ONLY the JSON object. No text before {. No text after }."
        );
    }

    public static String buildLearningPlanPrompt(List<String> missingSkills, String jobTitle) {
        return String.join("\n",
            "SYSTEM: You are a learning plan generator API. You must output ONLY a JSON array.",
            "Do NOT write any explanation, greeting, note, or markdown. Start your response with [ and end with ].",
            "",
            "The candidate is missing these skills for the role of " + safe(jobTitle) + ": " + joinSkills(missingSkills),
            "",
            "=== OUTPUT FORMAT ===",
            "Output a JSON array with exactly 7 items (one per day). Each item must follow this exact structure:",
            "[",
            "  {",
            "    \"day\": \"Day 1\",",
            "    \"topic\": \"" + firstSkillOrDefault(missingSkills) + " Basics\",",
            "    \"tasks\": [",
            "      \"Watch a beginner tutorial on " + firstSkillOrDefault(missingSkills) + " on YouTube\",",
            "      \"Set up the development environment and run a Hello World example\",",
            "      \"Read the official getting-started documentation\"",
            "    ],",
            "    \"hours\": 3,",
            "    \"priority\": \"HIGH\"",
            "  },",
            "  {",
            "    \"day\": \"Day 2\",",
            "    \"topic\": \"" + firstSkillOrDefault(missingSkills) + " Core Concepts\",",
            "    \"tasks\": [",
            "      \"Build a small hands-on practice project using " + firstSkillOrDefault(missingSkills) + "\",",
            "      \"Follow along with a step-by-step tutorial\",",
            "      \"Solve 2 beginner exercises on this topic\"",
            "    ],",
            "    \"hours\": 3,",
            "    \"priority\": \"HIGH\"",
            "  }",
            "]",
            "(continue for Days 3-7, covering the remaining skills: " + joinSkills(missingSkills) + ")",
            "",
            "=== RULES ===",
            "- Output exactly 7 items, one for each day",
            "- topic must be a specific skill name or sub-topic (e.g. 'Docker Containers', 'REST API Design') — NOT the word 'string' or 'topic'",
            "- tasks must contain exactly 3 real actionable learning steps — NOT the word 'string' or 'tasks'",
            "- hours must be a number: 3 for HIGH priority days, 2 for MEDIUM priority days",
            "- priority must be exactly 'HIGH' for days 1-4, exactly 'MEDIUM' for days 5-7",
            "- Distribute the missing skills across the 7 days",
            "- Do NOT repeat the example structure literally — generate content specific to: " + joinSkills(missingSkills),
            "",
            "IMPORTANT: Output ONLY the JSON array. No text before [. No text after ]."
        );
    }

    public static String buildYoutubePrompt(List<String> missingSkills) {
        return String.join("\n",
            "SYSTEM: You are a YouTube learning resource API. You must output ONLY a JSON array.",
            "Do NOT write any explanation, greeting, or markdown. Start your response with [ and end with ].",
            "",
            "Missing skills that the candidate needs to learn: " + joinSkills(missingSkills),
            "",
            "=== OUTPUT FORMAT ===",
            "Output exactly this JSON array structure with one entry per skill (real values, not placeholders):",
            "[",
            "  {",
            "    \"skill\": \"Spring Boot\",",
            "    \"channelName\": \"Amigoscode\",",
            "    \"searchQuery\": \"Spring Boot tutorial for beginners 2024\",",
            "    \"reason\": \"Amigoscode provides comprehensive Spring Boot tutorials with real-world projects.\"",
            "  },",
            "  {",
            "    \"skill\": \"Docker\",",
            "    \"channelName\": \"TechWorld with Nana\",",
            "    \"searchQuery\": \"Docker tutorial for beginners full course\",",
            "    \"reason\": \"TechWorld with Nana explains Docker concepts clearly with hands-on examples.\"",
            "  }",
            "]",
            "",
            "=== RULES ===",
            "- Create exactly ONE entry for each of these skills: " + joinSkills(missingSkills),
            "- channelName must be a real well-known YouTube channel such as: freeCodeCamp, Traversy Media, Amigoscode, TechWorld with Nana, Programming with Mosh, The Net Ninja, Fireship, Telusko, CodeWithHarry, Apna College, Tech With Tim, Corey Schafer",
            "- searchQuery must be a real search term a person would type into YouTube to learn that skill",
            "- reason must be one sentence explaining why that channel is good for that skill",
            "- skill must exactly match one of the missing skills listed above",
            "- Do NOT output field names as values (do not write 'string' or 'channelName' as the value)",
            "",
            "IMPORTANT: Output ONLY the JSON array. No text before [. No text after ]."
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

    private static String firstSkillOrDefault(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return "the required skill";
        }
        return missingSkills.get(0);
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}

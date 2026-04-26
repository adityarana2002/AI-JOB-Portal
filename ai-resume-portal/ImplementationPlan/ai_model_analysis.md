# AI Model Analysis — AI Resume Portal

**Date:** 2026-04-26  
**Current model:** `llama3.2:3b`  
**AI server:** Ollama at `http://localhost:11434`

---

## The Error You Saw

```
Cannot construct instance of `LearningPlanItem`: no String-argument constructor/factory method
to deserialize from String value ('Install Spring Tool Suite')
at [Source: "["Install Spring Tool Suite", "Complete Spring Boot tutorial on Spring.io", ...]"
```

### Root Cause

The backend expected the AI to return a **structured JSON array** like this:

```json
[
  {
    "day": "Day 1",
    "topic": "Spring Boot Basics",
    "tasks": ["Install Spring Tool Suite", "Watch tutorial"],
    "hours": 3,
    "priority": "HIGH"
  }
]
```

But `llama3.2:3b` returned a **flat string array** like this:

```json
["Install Spring Tool Suite", "Complete Spring Boot tutorial on Spring.io", "Set up a Spring Boot project locally"]
```

The Jackson deserializer tried to convert each string into a `LearningPlanItem` object and failed because a string can't be cast to an object.

### Why llama3.2:3b Does This

The original prompt used abstract placeholders:
```
"tasks": ["string", "string"]
```

Small models (≤ 3B parameters) often:
1. **Fill in the placeholder literally** — output the word `"string"` instead of real content
2. **Simplify the schema** — flatten nested arrays into a flat list
3. **Ignore field names** — output just the values without the JSON keys

---

## What Was Fixed

### Fix 1 — Better Prompt (`PromptTemplates.java`)

**Before:** Abstract placeholder template (single line, hard to parse):
```
[{"day": "Day 1", "topic": "string", "tasks": ["string", "string"], "hours": 3, "priority": "HIGH"}, ...]
```

**After:** Concrete few-shot example with real values + explicit "do not output 'string'" rule:
```
Now generate the same 7-day structure but with content specific to: Java, Spring Boot
Rules:
- Each "topic" must be a specific skill name, not the word "string"
- Each "tasks" must be real actionable steps, not the word "string"
- Output the JSON array only. Start with [ and end with ]
```

### Fix 2 — Fallback Parser (`AiScreeningService.java`)

Even with the better prompt, a small model can still misbehave. Added a two-stage parser:

1. **Stage 1** — Try to parse as `List<LearningPlanItem>` (the correct structure)
2. **Stage 2** — If Stage 1 fails, try to parse as `List<String>` (flat fallback)
   - Groups strings 3 per day
   - Auto-generates `day`, `hours`, and `priority` values
   - Uses the first task string as the `topic`
   - Returns a working (imperfect but non-crashing) learning plan

This means the application **no longer crashes** even if the model misbehaves.

---

## Is `llama3.2:3b` the Right Model?

### Short Answer

It works, but it is the weakest model for this job. It will occasionally fail at complex JSON schemas even with the improved prompt.

### Model Comparison Table

| Model | Size | JSON Reliability | Speed | RAM Needed | Best For |
|-------|------|-----------------|-------|-----------|---------|
| `llama3.2:3b` *(current)* | 3B | ⭐⭐ Fair | ★★★★★ Very fast | ~3 GB | Quick tests |
| `llama3.1:8b` | 8B | ⭐⭐⭐ Good | ★★★★ Fast | ~6 GB | Balanced option |
| `mistral:7b` | 7B | ⭐⭐⭐⭐ Very good | ★★★★ Fast | ~5 GB | **Best JSON adherence at 7B** |
| `deepseek-coder:6.7b` *(original plan)* | 6.7B | ⭐⭐⭐⭐ Very good | ★★★ Moderate | ~5 GB | Code + structured output |
| `llama3:8b` | 8B | ⭐⭐⭐ Good | ★★★★ Fast | ~6 GB | General purpose |
| `phi3:3.8b` | 3.8B | ⭐⭐⭐ Good | ★★★★★ Fast | ~3 GB | Better than 3b at JSON |

### Recommendation

**For development/testing (your PC has limited RAM):**  
→ Keep `llama3.2:3b` — the fallback parser now prevents crashes

**For best results (if you have 6+ GB free RAM):**  
→ Switch to `mistral:7b` — best JSON reliability in the 7B class

**Original project plan model:**  
→ `deepseek-coder:6.7b` was the intended model — it is specialized in code and structured output, making it more reliable for JSON schema following

---

## How to Change the Model

### Step 1 — Pull the model in Ollama

```bash
# For mistral 7B
ollama pull mistral:7b

# For deepseek-coder (original plan model)
ollama pull deepseek-coder:6.7b

# For phi3 (small but better JSON than llama3.2:3b)
ollama pull phi3:3.8b
```

Check which models you already have:
```bash
ollama list
```

### Step 2 — Update `application.yml`

```yaml
spring:
  ai:
    ollama:
      chat:
        options:
          model: mistral:7b    # ← change this line
```

File location: `ai-resume-portal/backend/src/main/resources/application.yml`

### Step 3 — Restart the backend

```bash
cd ai-resume-portal/backend
mvn spring-boot:run
```

No code changes needed — only the `application.yml` model name.

---

## How to Test the AI After Fixing

### Option A — Use the built-in AI test endpoint

```
POST http://localhost:8080/api/ai/test
Authorization: Bearer <any_valid_jwt_token>
Content-Type: application/json

{
  "jobTitle": "Java Backend Developer",
  "jobDescription": "Build REST APIs with Spring Boot and MySQL",
  "requiredSkills": "Java, Spring Boot, MySQL, REST API, JWT",
  "experienceRequired": "1-2 years",
  "resumeText": "I know Python and Django. I built a Flask web app. I have 1 year of web development experience."
}
```

**Expected result:** The candidate is NOT eligible (Python/Django don't match Java/Spring Boot), so a learning plan is generated. Verify the response contains:
```json
{
  "learningPlan": [
    { "day": "Day 1", "topic": "...", "tasks": ["...", "..."], "hours": 3, "priority": "HIGH" }
  ]
}
```

### Option B — Full flow test

1. Log in as Job Seeker
2. Browse Jobs → Apply to a Java backend role (upload a Python-focused resume PDF)
3. Wait for screening (the AI runs automatically after upload)
4. Go to **My Applications** → click the application → **View Screening Result**
5. Scroll to the **7-Day Learning Plan** section — it should show a properly structured timeline

### What a Broken Response Looks Like

If you see the timeline items all have the same `topic` as a task sentence (e.g., "Day 1 — Install Spring Tool Suite"), the fallback parser activated. This means the model still returned a flat array. Switch to a better model (see above).

---

## Summary of Files Changed

| File | What Changed |
|------|-------------|
| `backend/.../ai/prompt/PromptTemplates.java` | `buildLearningPlanPrompt` rewritten with concrete few-shot examples |
| `backend/.../ai/service/AiScreeningService.java` | Added `parseLearningPlan()` with flat-array fallback + `wrapFlatTasksIntoLearningPlan()` |
| `backend/src/main/resources/application.yml` | *(no change — model name is your decision)* |

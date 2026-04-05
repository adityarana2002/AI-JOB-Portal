# AI Resume Screening Job Portal — Implementation Plan

## 🎯 Project Overview

A full-stack **AI-powered Job Portal** where:
- **Employers (Job Posters)** can create and manage job vacancies
- **Job Seekers (Applicants)** can browse jobs, upload resumes, and apply — AI analyzes their resume against the job description
- **Super Admin** has a bird's-eye view of all jobs, applicants, and AI screening results

**When a Job Seeker applies**, the AI (Ollama) will:
1. Analyze the resume against the job description
2. Give a **match score (0-100)** and eligibility verdict
3. List **matched skills** and **missing skills**
4. If **not eligible** → generate a **1-week learning plan** (day-by-day schedule)
5. Provide **YouTube channel/video links** for each skill gap

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Java + Spring Boot 3 | Java 17+, Spring Boot 3.2+ |
| **Frontend** | React + TypeScript | React 18+, Vite 5+ |
| **Database** | MySQL | 8.0+ |
| **AI/LLM** | Ollama (local) | Latest (with `deepseek-coder:6.7b` model) |
| **AI Integration** | Spring AI + Ollama Starter | Spring AI 1.0+ |
| **PDF Parsing** | Apache Tika | 2.9+ |
| **Auth** | Spring Security + JWT | — |
| **File Storage** | Local file system (uploads/) | — |
| **API Docs** | SpringDoc OpenAPI (Swagger) | 2.3+ |

---

## 📁 Project Folder Structure

```
p:\College Major Project\ai-resume-portal\
├── backend/                          # Spring Boot Application
│   ├── pom.xml
│   ├── src/main/java/com/portal/
│   │   ├── AiResumePortalApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── OllamaConfig.java
│   │   ├── auth/
│   │   │   ├── controller/AuthController.java
│   │   │   ├── service/AuthService.java
│   │   │   ├── dto/LoginRequest.java
│   │   │   ├── dto/RegisterRequest.java
│   │   │   ├── dto/AuthResponse.java
│   │   │   └── util/JwtTokenProvider.java
│   │   ├── user/
│   │   │   ├── controller/UserController.java
│   │   │   ├── service/UserService.java
│   │   │   ├── repository/UserRepository.java
│   │   │   ├── entity/User.java
│   │   │   ├── entity/Role.java (enum: SUPER_ADMIN, EMPLOYER, JOB_SEEKER)
│   │   │   └── dto/UserDTO.java
│   │   ├── job/
│   │   │   ├── controller/JobController.java
│   │   │   ├── service/JobService.java
│   │   │   ├── repository/JobRepository.java
│   │   │   ├── entity/Job.java
│   │   │   └── dto/JobDTO.java
│   │   ├── application/
│   │   │   ├── controller/ApplicationController.java
│   │   │   ├── service/ApplicationService.java
│   │   │   ├── repository/ApplicationRepository.java
│   │   │   ├── entity/JobApplication.java
│   │   │   └── dto/ApplicationDTO.java
│   │   ├── resume/
│   │   │   ├── service/ResumeParsingService.java      # Apache Tika
│   │   │   └── service/ResumeStorageService.java      # File I/O
│   │   └── ai/
│   │       ├── controller/AiController.java           # Test AI endpoint
│   │       ├── service/AiScreeningService.java        # Core AI logic
│   │       ├── dto/ScreeningResult.java
│   │       ├── dto/LearningPlan.java
│   │       └── prompt/PromptTemplates.java            # All AI prompts
│   └── src/main/resources/
│       ├── application.yml
│       └── uploads/                                   # Resume files
│
├── frontend/                         # React + TypeScript (Vite)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/
│       │   └── AppRouter.tsx
│       ├── layouts/
│       │   ├── AuthLayout.tsx
│       │   ├── EmployerLayout.tsx
│       │   ├── JobSeekerLayout.tsx
│       │   └── AdminLayout.tsx
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx
│       │   │   └── RegisterPage.tsx
│       │   ├── employer/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── PostJob.tsx
│       │   │   ├── MyJobs.tsx
│       │   │   └── ViewApplicants.tsx
│       │   ├── jobseeker/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── BrowseJobs.tsx
│       │   │   ├── ApplyJob.tsx
│       │   │   ├── MyApplications.tsx
│       │   │   └── ScreeningResult.tsx        # AI Result page
│       │   └── admin/
│       │       ├── Dashboard.tsx
│       │       ├── AllJobs.tsx
│       │       ├── AllApplicants.tsx
│       │       └── ScreeningReports.tsx
│       ├── components/
│       │   ├── ui/                             # Reusable UI components
│       │   ├── charts/                         # Learning plan chart
│       │   └── common/
│       ├── services/
│       │   ├── api.ts                          # Axios instance
│       │   ├── authService.ts
│       │   ├── jobService.ts
│       │   ├── applicationService.ts
│       │   └── aiService.ts
│       ├── hooks/
│       ├── types/
│       │   ├── user.ts
│       │   ├── job.ts
│       │   ├── application.ts
│       │   └── screening.ts
│       ├── context/
│       │   └── AuthContext.tsx
│       └── styles/
│           ├── index.css
│           └── variables.css
│
└── docs/
    └── api-design.md
```

---

## 🗄️ Database Schema (MySQL)

### Table: `users`
| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `full_name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (BCrypt) |
| `role` | ENUM('SUPER_ADMIN','EMPLOYER','JOB_SEEKER') | NOT NULL |
| `phone` | VARCHAR(20) | NULLABLE |
| `profile_image` | VARCHAR(255) | NULLABLE |
| `company_name` | VARCHAR(150) | NULLABLE (for EMPLOYER) |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | DATETIME | DEFAULT NOW |
| `updated_at` | DATETIME | ON UPDATE NOW |

### Table: `jobs`
| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `employer_id` | BIGINT | FK → users.id |
| `title` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `required_skills` | TEXT | NOT NULL (comma-separated or JSON) |
| `experience_required` | VARCHAR(50) | e.g., "2-4 years" |
| `salary_range` | VARCHAR(50) | NULLABLE |
| `location` | VARCHAR(100) | NOT NULL |
| `job_type` | ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP') | NOT NULL |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `deadline` | DATE | NULLABLE |
| `created_at` | DATETIME | DEFAULT NOW |
| `updated_at` | DATETIME | ON UPDATE NOW |

### Table: `job_applications`
| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `job_id` | BIGINT | FK → jobs.id |
| `applicant_id` | BIGINT | FK → users.id |
| `resume_path` | VARCHAR(500) | NOT NULL |
| `cover_letter` | TEXT | NULLABLE |
| `status` | ENUM('PENDING','SCREENING','SCREENED','SHORTLISTED','REJECTED') | DEFAULT 'PENDING' |
| `created_at` | DATETIME | DEFAULT NOW |

### Table: `screening_results`
| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `application_id` | BIGINT | FK → job_applications.id, UNIQUE |
| `match_score` | INT | 0-100 |
| `is_eligible` | BOOLEAN | NOT NULL |
| `matched_skills` | JSON | Array of matched skills |
| `missing_skills` | JSON | Array of missing skills |
| `strengths` | JSON | Array of strength points |
| `weaknesses` | JSON | Array of weakness points |
| `summary` | TEXT | AI-generated summary |
| `learning_plan` | JSON | 7-day plan (if not eligible) |
| `youtube_links` | JSON | Recommended learning resources |
| `raw_ai_response` | TEXT | Full AI response for debugging |
| `created_at` | DATETIME | DEFAULT NOW |

---

## 🤖 AI Prompt Engineering (Ollama — `deepseek-coder:6.7b`)

> [!IMPORTANT]
> We are using **`deepseek-coder:6.7b`** — a code-focused model that runs well on limited hardware. Since 6.7B models can struggle with very large/deeply nested JSON, we use a **two-step prompt strategy**: Step 1 does the screening, Step 2 generates the learning plan (only if not eligible). This gives more reliable, parseable results.

> [!WARNING]
> **Model-Specific Optimizations:**
> - **Temperature = 0** — for deterministic, consistent JSON output
> - **Flatter JSON structure** — avoid deep nesting, the 6.7B model handles flat objects more reliably
> - **Code-style prompts** — `deepseek-coder` responds best to structured, code-like instructions
> - **Two-step prompting** — split complex tasks so each response is shorter & cleaner
> - **JSON post-processing** in backend — regex to extract JSON from any surrounding text, retry on parse failure

### Ollama API Configuration (`application.yml`)

```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        options:
          model: deepseek-coder:6.7b
          temperature: 0.0
          num-predict: 4096
```

---

### STEP 1 — Screening Prompt (Always Runs)

```text
You are a resume screening system. Analyze the resume against the job and return ONLY valid JSON.

JOB:
- Title: {jobTitle}
- Description: {jobDescription}
- Required Skills: {requiredSkills}
- Experience: {experienceRequired}

RESUME:
{resumeText}

Return ONLY this JSON (no markdown, no explanation):
{"candidateName": "string", "matchScore": 0, "isEligible": false, "matchedSkills": ["string"], "missingSkills": ["string"], "strengths": ["string", "string", "string"], "weaknesses": ["string", "string", "string"], "summary": "string"}

Rules:
- matchScore: 0-100 integer. Scoring: skills=40%, experience=30%, education=15%, fit=15%
- isEligible: true if matchScore >= 60
- matchedSkills: skills from required list found in resume
- missingSkills: skills from required list NOT found in resume
- strengths: exactly 3 specific points with evidence
- weaknesses: exactly 3 specific gaps
- summary: 2-3 sentence assessment
- Output must be valid parseable JSON only
```

---

### STEP 2 — Learning Plan Prompt (Only If `isEligible == false`)

```text
You are a learning advisor. Create a 7-day study plan for a job candidate who is missing these skills: {missingSkills}

The target job is: {jobTitle}

Return ONLY this JSON array (no markdown, no explanation):
[{"day": "Day 1", "topic": "string", "tasks": ["string", "string"], "hours": 3, "priority": "HIGH"}, {"day": "Day 2", "topic": "string", "tasks": ["string", "string"], "hours": 3, "priority": "HIGH"}, {"day": "Day 3", "topic": "string", "tasks": ["string", "string"], "hours": 2, "priority": "MEDIUM"}, {"day": "Day 4", "topic": "string", "tasks": ["string", "string"], "hours": 2, "priority": "MEDIUM"}, {"day": "Day 5", "topic": "string", "tasks": ["string", "string"], "hours": 2, "priority": "MEDIUM"}, {"day": "Day 6", "topic": "string", "tasks": ["string", "string"], "hours": 3, "priority": "HIGH"}, {"day": "Day 7", "topic": "Review and Practice", "tasks": ["Review all topics", "Build mini-project"], "hours": 4, "priority": "HIGH"}]

Rules:
- Each day focuses on ONE missing skill or concept
- tasks: 2-3 actionable learning tasks per day
- hours: realistic hours (2-4)
- priority: HIGH for critical skills, MEDIUM for nice-to-have
- Output must be valid parseable JSON array only
```

---

### STEP 3 — YouTube Recommendations Prompt (Only If `isEligible == false`)

```text
You are a learning resource advisor. For each missing skill below, suggest ONE popular YouTube channel and a search query to learn it.

Missing Skills: {missingSkills}

Return ONLY this JSON array (no markdown, no explanation):
[{"skill": "string", "channelName": "string", "searchQuery": "string", "reason": "string"}]

Use ONLY well-known channels like: freeCodeCamp, Traversy Media, Programming with Mosh, The Net Ninja, Fireship, Telusko, CodeWithHarry, Apna College, Tech With Tim, Corey Schafer.

Rules:
- One entry per missing skill
- searchQuery: exact text to paste into YouTube search bar
- reason: one sentence why this channel is good for this skill
- Output must be valid parseable JSON array only
```

---

### Backend JSON Safety (Post-Processing in Java)

Since `deepseek-coder:6.7b` may occasionally wrap JSON in markdown code blocks or add text before/after, the backend will include a **JSON sanitizer**:

```java
// In AiScreeningService.java
private String extractJson(String raw) {
    // Remove markdown code block wrappers if present
    String cleaned = raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
    // Find the first { or [ and last } or ]
    int start = Math.min(
        cleaned.indexOf('{') == -1 ? Integer.MAX_VALUE : cleaned.indexOf('{'),
        cleaned.indexOf('[') == -1 ? Integer.MAX_VALUE : cleaned.indexOf('[')
    );
    int endObj = cleaned.lastIndexOf('}');
    int endArr = cleaned.lastIndexOf(']');
    int end = Math.max(endObj, endArr);
    if (start != Integer.MAX_VALUE && end > start) {
        return cleaned.substring(start, end + 1);
    }
    return cleaned; // fallback
}
```

> [!TIP]
> **Why two-step prompting?** A 6.7B model produces **much cleaner JSON** when asked for one focused task at a time, rather than a massive nested object. Step 1 (~200 tokens output) is fast. Steps 2 & 3 only run when needed (~200 tokens each). Total AI time: ~15-30 seconds on modest hardware.

---

## 🔌 REST API Design

### Auth APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Authenticated |

### Job APIs (Employer)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/jobs` | Create a new job | EMPLOYER |
| GET | `/api/jobs` | List all active jobs | Public |
| GET | `/api/jobs/{id}` | Get job details | Public |
| PUT | `/api/jobs/{id}` | Update a job | EMPLOYER (owner) |
| DELETE | `/api/jobs/{id}` | Delete/deactivate job | EMPLOYER (owner) |
| GET | `/api/jobs/my-jobs` | Employer's own jobs | EMPLOYER |
| GET | `/api/jobs/{id}/applicants` | View applicants for a job | EMPLOYER (owner) |

### Application APIs (Job Seeker)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/applications/{jobId}/apply` | Apply for a job (multipart: resume + data) | JOB_SEEKER |
| GET | `/api/applications/my-applications` | List my applications | JOB_SEEKER |
| GET | `/api/applications/{id}` | Get application details | JOB_SEEKER (owner) |
| GET | `/api/applications/{id}/screening` | Get AI screening result | JOB_SEEKER (owner) / EMPLOYER (job owner) |

### AI Screening APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/ai/screen/{applicationId}` | Trigger AI screening | SYSTEM (auto on apply) |
| GET | `/api/ai/result/{applicationId}` | Get screening result | Authenticated |
| POST | `/api/ai/test` | Test AI with raw text (dev only) | SUPER_ADMIN |

### Admin APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Dashboard stats | SUPER_ADMIN |
| GET | `/api/admin/users` | List all users | SUPER_ADMIN |
| GET | `/api/admin/jobs` | List all jobs | SUPER_ADMIN |
| GET | `/api/admin/applications` | List all applications | SUPER_ADMIN |
| GET | `/api/admin/screenings` | List all screening results | SUPER_ADMIN |
| PUT | `/api/admin/users/{id}/status` | Activate/Deactivate user | SUPER_ADMIN |

---

## 📊 Frontend Pages & Features

### 🔐 Auth Module
- **Login Page** — Email + Password, role-based redirect
- **Register Page** — Full Name, Email, Password, Role (Employer/Job Seeker), Company Name (if Employer)

### 👔 Employer Module
- **Dashboard** — Stats (total jobs posted, total applicants, screening summary)
- **Post Job** — Form: Title, Description, Required Skills (tag input), Experience, Salary, Location, Type, Deadline
- **My Jobs** — Table/cards of posted jobs with status, applicant count
- **View Applicants** — For each job: list of applicants with resume download + AI screening score + screening details

### 🎓 Job Seeker Module
- **Dashboard** — Stats (applications submitted, screened, accepted/rejected)
- **Browse Jobs** — Searchable/filterable list of all active jobs
- **Apply Job** — Upload resume (PDF), optional cover letter, submit
- **My Applications** — Track all applications with status
- **Screening Result Page** ⭐ — The **hero page** showing:
  - Match Score (circular gauge/progress bar)
  - Eligibility status (✅ Eligible / ❌ Not Eligible)
  - Matched Skills (green chips) vs Missing Skills (red chips)
  - Strengths & Weaknesses list
  - AI Summary
  - **If not eligible:**
    - 📅 **7-Day Learning Plan** (interactive timeline/chart)
    - 🎥 **YouTube Recommendations** (clickable cards with channel name & search link)

### 🛡️ Super Admin Module
- **Dashboard** — Global stats (total users, jobs, applications, screenings)
- **All Jobs** — View/manage all jobs across all employers
- **All Applicants** — View all applications with screening status
- **Screening Reports** — Detailed AI screening analytics
- **User Management** — Activate/deactivate users

---

## 🔧 Phase-by-Phase Execution Plan

> [!IMPORTANT]
> We will build and **test each phase completely** before moving to the next. I will show you what I did, you verify, and we proceed.

---

### Phase 1: Project Setup & Scaffolding
**What we'll do:**
- Create the project folder structure
- Initialize Spring Boot backend with Maven (`pom.xml` with all dependencies)
- Initialize React + TypeScript frontend with Vite
- Set up MySQL database and `application.yml`
- Verify: Both backend and frontend start without errors

**Test:** `mvn spring-boot:run` starts on port 8080, `npm run dev` starts on port 5173

---

### Phase 2: Database Entities & Repositories
**What we'll do:**
- Create all JPA entities: `User`, `Job`, `JobApplication`, `ScreeningResult`
- Create `Role` enum
- Create all Spring Data JPA repositories
- Configure Hibernate auto-DDL to create tables
- Verify: Tables are created in MySQL

**Test:** Start the backend → check MySQL that all 4 tables exist with correct columns

---

### Phase 3: Authentication (Register + Login + JWT)
**What we'll do:**
- Implement `AuthController`, `AuthService`, `JwtTokenProvider`
- Spring Security config with JWT filter
- DTOs for login/register
- CORS configuration
- Verify: Register a user via Postman, login and get JWT token

**Test:** 
- `POST /api/auth/register` → creates user in DB
- `POST /api/auth/login` → returns JWT
- `GET /api/auth/me` with JWT → returns user info

---

### Phase 4: Job CRUD (Employer)
**What we'll do:**
- Implement `JobController`, `JobService`, `JobRepository`
- DTOs for create/update/view job
- Authorization: only EMPLOYER can create jobs
- Verify: Create, read, update, delete jobs via Postman

**Test:** Full CRUD with Postman using JWT of an EMPLOYER user

---

### Phase 5: Job Application + Resume Upload
**What we'll do:**
- Implement `ApplicationController`, `ApplicationService`
- `ResumeStorageService` — save uploaded PDF to `uploads/` folder
- `ResumeParsingService` — extract text from PDF using Apache Tika
- Multipart file upload endpoint
- Verify: Apply for a job with a PDF resume, file is saved, text is extracted

**Test:**
- `POST /api/applications/{jobId}/apply` with PDF → file saved + text extracted (log the text)

---

### Phase 6: Ollama AI Integration (`deepseek-coder:6.7b`)
**What we'll do:**
- Verify Ollama is running with `deepseek-coder:6.7b` model (`ollama list`)
- Configure `application.yml` with Ollama settings (temperature=0, model name)
- Implement `PromptTemplates.java` with the 3-step prompt strategy
- Implement `AiScreeningService` with:
  - Step 1: Screening prompt → parse JSON
  - Step 2: Learning plan prompt (if not eligible) → parse JSON
  - Step 3: YouTube recommendations prompt (if not eligible) → parse JSON
  - JSON sanitizer (`extractJson()` method) for robustness
- `POST /api/ai/test` endpoint to test AI with raw text
- Verify: Send a test resume text + job description → get structured JSON back

**Test:**
- `POST /api/ai/test` with sample resume text + job description
- Verify Step 1 returns valid screening JSON
- Verify Steps 2 & 3 fire only when `isEligible == false`
- Verify JSON sanitizer handles markdown-wrapped responses

---

### Phase 7: End-to-End Application + Screening Flow
**What we'll do:**
- Connect the application flow: Apply → Upload Resume → Parse Text → Send to AI → Save Result
- Auto-trigger screening when a job seeker applies
- Store `ScreeningResult` in database
- `GET /api/applications/{id}/screening` → returns screening result
- Verify: Apply for a job → AI screening runs → result stored and retrievable

**Test:** Full flow from apply to screening result retrieval via Postman

---

### Phase 8: Frontend — Auth + Layout + Routing
**What we'll do:**
- Set up React Router with role-based routing
- Build Auth pages (Login, Register) with premium UI
- Create layout components (Sidebar, Navbar, etc.) for each role
- Auth context with JWT management
- Connect to backend API
- Verify: Register and login from the browser

**Test:** Register → Login → Redirect to correct dashboard based on role

---

### Phase 9: Frontend — Employer & Job Seeker Pages
**What we'll do:**
- Employer: Post Job form, My Jobs list, View Applicants
- Job Seeker: Browse Jobs, Apply (with file upload), My Applications
- **Screening Result Page** — the showpiece:
  - Circular score gauge
  - Skill chips (matched/missing)
  - Strengths/Weaknesses cards
  - 7-day learning plan timeline
  - YouTube recommendation cards
- Verify: Full user flow in browser

**Test:** Register as Employer → Post Job → Register as Seeker → Browse → Apply → View AI Result

---

### Phase 10: Super Admin + Polish
**What we'll do:**
- Admin Dashboard with statistics
- Admin views: All Jobs, All Users, All Applications, Screening Reports
- User management (activate/deactivate)
- UI polish: animations, loading states, error handling, responsive design
- Verify: Admin can see everything

**Test:** Login as Super Admin → verify all admin views

---

## ⚠️ User Review Required

> [!IMPORTANT]
> **Database:** I plan to use MySQL. Please confirm your MySQL version and provide the database name you'd like (suggested: `ai_resume_portal`). Also confirm MySQL username/password (default: `root` / `root`).

> [!NOTE]
> **Ollama Model:** ✅ Confirmed — using **`deepseek-coder:6.7b`** (optimized for low RAM/GPU hardware). Make sure to pull it before Phase 6: `ollama pull deepseek-coder:6.7b`

> [!IMPORTANT]
> **Java Version:** I will use Java 17. Please confirm you have JDK 17+ installed. Run `java -version` to check.

> [!IMPORTANT]
> **Node.js:** Please confirm you have Node.js 18+ installed. Run `node -v` to check.

---

## Open Questions

> [!WARNING]
> 1. **Do you want email notifications** when a screening result is ready? (Can add later)
> 2. **Should the AI screening happen synchronously** (wait on apply page) or **asynchronously** (seeker gets notified later)? I recommend **asynchronous** with a loading/polling state since AI takes 10-30 seconds.
> 3. **Do you want a Super Admin pre-seeded** in the database, or should Super Admin also register? (I recommend pre-seeding one admin account)
> 4. **Resume format:** PDF only, or also DOCX? Apache Tika supports both, just confirming.

---

## Verification Plan

### Automated Tests
- Test each backend API with **Postman** or **cURL** at every phase
- Run `mvn test` for unit tests on services
- Frontend: Manual browser testing at Phase 8+

### Manual Verification
- After each phase, I will show you exactly what was built
- You test it yourself (Postman for backend, browser for frontend)
- We only proceed to the next phase after you confirm ✅

---

> [!TIP]
> **Recommended Ollama setup commands (run before Phase 6):**
> ```bash
> # Install Ollama from https://ollama.com
> ollama pull deepseek-coder:6.7b
> ollama serve
> ```
> The model will run at `http://localhost:11434` — no API key needed!
> 
> **Quick test to verify model works:**
> ```bash
> curl http://localhost:11434/api/generate -d '{
>   "model": "deepseek-coder:6.7b",
>   "prompt": "Return only valid JSON: {\"status\": \"ok\", \"message\": \"hello\"}",
>   "stream": false,
>   "options": { "temperature": 0 }
> }'
> ```
> If you get a JSON response, you're ready! 🎉

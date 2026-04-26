# New Feature Plan — AI Resume Portal
**Project:** AI Resume Screening Portal  
**Date:** 2026-04-26  
**Author:** Development Team  
**Status:** Proposed

---

## Current State — What's Already Built

| # | Module | Status |
|---|--------|--------|
| 1 | Auth — Register / Login / JWT / Role Routing / OTP Email Verification | ✅ Done |
| 2 | Employer — Post Job / Manage Jobs / Close Job | ✅ Done |
| 3 | Job Seeker — Browse Jobs / Apply with Resume / Saved Jobs | ✅ Done |
| 4 | AI Screening — Score, Eligibility, Skill Gap, 7-Day Learning Plan | ✅ Done |
| 5 | Candidate Ranking Leaderboard | ✅ Done |
| 6 | Interview Scheduling — Full lifecycle (Schedule/Confirm/Decline/Cancel/Reschedule) | ✅ Done |
| 7 | In-App Notifications + Real-Time SSE Push | ✅ Done |
| 8 | Audit Logs (Admin) | ✅ Done |
| 9 | CSV + PDF Export | ✅ Done |
| 10 | Application Withdrawal | ✅ Done |
| 11 | Super Admin Dashboard, User Management, Screening Reports | ✅ Done |
| 12 | SMTP Email — Welcome, Application, Status, Interview, OTP, Withdrawal | ✅ Done |
| 13 | Profile Page — View and edit | ✅ Done |

---

## 🔥 Phase 1 — AI Intelligence Upgrades (High Impact)

These features leverage the existing Ollama AI engine to add significant new value.

---

### Feature 1 — AI Interview Question Generator

**What it does:**  
For any shortlisted candidate, an employer clicks "Generate Questions" and the system uses the job description + candidate's resume skills to produce 10 tailored interview questions in 3 categories: Technical, Behavioral, Situational.

**Why it matters:**  
Employers spend 30+ minutes per candidate preparing questions. This feature eliminates prep time and ensures consistent, role-specific evaluation.

**Backend:**
- `InterviewQuestionService.generateQuestions(Long applicationId)` — builds Ollama prompt with JD + candidate skills
- New `InterviewQuestion` entity to cache results (avoid regeneration)
- `GET /api/applications/{id}/interview-questions`

**Frontend:**
- "Generate Questions" button in ViewApplicants per candidate
- Modal with tabbed view: Technical / Behavioral / Situational
- "Copy All" button for employer convenience

**Effort:** Medium | **Impact:** Very High

---

### Feature 2 — Resume ATS Score Checker

**What it does:**  
Before submitting an application, a job seeker uploads their resume and gets an instant ATS (Applicant Tracking System) readiness score (0–100) with a breakdown: keyword match, formatting quality, section presence, contact info, length.

**Why it matters:**  
70%+ of resumes are filtered by ATS before a human reads them. Teaching job seekers ATS readiness makes the platform genuinely useful even if they don't get the job.

**Backend:**
- `AtsScoreService.score(String resumeText, String jobDescription)` with scoring rules:
  - Keywords matching JD (0–30 pts)
  - Resume length 300–800 words (0–10 pts)
  - Has Education, Experience, Skills sections (0–30 pts)
  - Contact info: email + phone (0–15 pts)
  - No ATS-unfriendly formatting (0–15 pts)
- `POST /api/jobseeker/resume/ats-score` (accepts resume file + jobId)
- Returns `AtsScoreResponse { totalScore, breakdown, tips[] }`

**Frontend:**
- In `ApplyJob.tsx`, after resume upload → "Check ATS Score" button
- Circular gauge (Red <50 / Yellow 50–75 / Green >75)
- Expandable tip list from response

**Effort:** Medium | **Impact:** High

---

### Feature 3 — AI Resume Improvement Tips

**What it does:**  
After viewing their screening result, a job seeker clicks "How To Improve" and the AI generates 5–8 specific, actionable bullet points: "Add Docker to your skills section", "Quantify your achievements with metrics", "Include a project section showcasing React work".

**Why it matters:**  
Current screening shows *what's missing*. This feature tells the candidate *how to fix it* — transforming the platform from a pass/fail gate into a career coach.

**Backend:**
- `ResumeTipsService.generateTips(Long applicationId)` via Ollama
- Cache tips in a `resume_tips` JSON column on `ScreeningResult`
- `GET /api/jobseeker/applications/{id}/resume-tips`

**Frontend:**
- Collapsible "How To Improve" panel in ScreeningResult page
- Each tip as a styled bullet with lightbulb icon + priority tag

**Effort:** Low-Medium | **Impact:** High

---

### Feature 4 — AI Cover Letter Generator

**What it does:**  
When applying to a job, a job seeker clicks "Generate Cover Letter" and the AI drafts a personalized cover letter based on their resume skills + the job description. The seeker can edit it before submitting.

**Why it matters:**  
Most job seekers struggle with cover letters. An AI-generated draft with the right keywords and structure gives them a massive head start.

**Backend:**
- `CoverLetterService.generate(Long jobId, String resumeText)` via Ollama
- Returns structured cover letter text
- `POST /api/jobseeker/jobs/{jobId}/generate-cover-letter` (accepts resume file)

**Frontend:**
- "Generate Cover Letter" button in ApplyJob page
- Pre-fills the cover letter textarea with AI-generated content
- Editable before submission

**Effort:** Low | **Impact:** High

---

## 📊 Phase 2 — Analytics & Decision-Making Tools

---

### Feature 5 — Hiring Funnel Analytics (Employer)

**What it does:**  
A visual funnel on the employer dashboard: Applied → Screened → Shortlisted → Interviewed → Hired. Each stage shows count and drop-off percentage from the previous stage.

**Why it matters:**  
If 90% of candidates are rejected at screening, the JD might be unrealistic. If 80% decline interviews, compensation or process needs fixing. Data-driven hiring decisions.

**Backend:**
- Add `INTERVIEWED` and `HIRED` to ApplicationStatus enum
- `getFunnelStats(Long employerId)` in ApplicationService
- `GET /api/employer/funnel`

**Frontend:**
- Horizontal stepped funnel bar in Employer Dashboard
- Each step: stage name + count + % conversion from previous stage
- Color-coded (green = high conversion, red = high drop-off)

**Effort:** Medium | **Impact:** High

---

### Feature 6 — Admin Analytics Dashboard (Charts & Trends)

**What it does:**  
The admin dashboard gets real analytics: registrations per week line chart, applications per day bar chart, top 5 most-applied jobs, employer activity heatmap, AI screening average scores over time.

**Why it matters:**  
Current admin dashboard shows static counts. Real admins need trends and patterns to make decisions about platform health.

**Backend:**
- `AdminAnalyticsService` with methods:
  - `getRegistrationTrend(int days)` — users per day
  - `getApplicationTrend(int days)` — apps per day
  - `getTopJobs(int limit)` — most-applied jobs
  - `getScreeningScoreDistribution()` — score buckets
- `GET /api/admin/analytics?period=30`

**Frontend:**
- New "Analytics" admin page with CSS-only bar/line charts (no chart library)
- Responsive grid layout with 4 chart panels
- Period toggle: 7 days / 30 days / 90 days

**Effort:** Medium-High | **Impact:** High

---

### Feature 7 — Side-by-Side Candidate Comparison

**What it does:**  
An employer selects exactly 2 candidates from the applicant list and clicks "Compare". A modal shows both candidates' AI scores, matched/missing skills, strengths, weaknesses in aligned columns.

**Why it matters:**  
Final hiring decisions often come down to 2–3 candidates. Comparison view eliminates back-and-forth between profiles.

**Backend:**
- `compareApplications(Long appAId, Long appBId, Authentication auth)` in ApplicationService
- Returns `CompareResponse { candidateA, candidateB }` with full screening data
- `GET /api/employer/compare?appA={id}&appB={id}`

**Frontend:**
- Checkbox selection on applicant cards in ViewApplicants
- "Compare Selected (2)" button appears when exactly 2 selected
- Two-column modal highlighting where each candidate is stronger (green highlight)

**Effort:** Medium | **Impact:** Medium-High

---

## 🧭 Phase 3 — Job Seeker Experience Upgrades

---

### Feature 8 — Smart Job Recommendations

**What it does:**  
On the job seeker dashboard and browse page, a "Recommended For You" section shows 5 jobs that best match the skills from their most recent screening result or profile data.

**Why it matters:**  
Browsing all jobs manually is slow. Personalized recommendations make the platform feel intelligent and increase application rates.

**Backend:**
- `JobRecommendationService.getRecommendations(Long userId)`:
  - Get user's skills from latest ScreeningResult matched_skills
  - Compute overlap with each active job's requiredSkills
  - Return top 5 sorted by overlap DESC
- `GET /api/jobseeker/recommended-jobs`

**Frontend:**
- Horizontal scroll "Recommended For You" section at top of BrowseJobs
- Each card shows a "Match %" badge
- Also shown on Job Seeker Dashboard

**Effort:** Medium | **Impact:** High

---

### Feature 9 — 30/60/90 Day Career Roadmap

**What it does:**  
Extends the existing 7-day plan into a comprehensive 90-day roadmap:
- Month 1: Foundation — learn missing skill basics
- Month 2: Projects — build portfolio projects using those skills
- Month 3: Advanced — contribute to open source, prep for re-application

**Why it matters:**  
A 7-day plan feels like a quick fix. A 90-day roadmap makes the platform feel like a career coach — massive differentiation from competitors.

**Backend:**
- Extend LearningPlan entity with `month1Plan`, `month2Plan`, `month3Plan` columns
- Modify AI prompt to generate structured 3-month response
- Extend existing `GET /api/ai/learning-plan/{applicationId}`

**Frontend:**
- Tabbed view in ScreeningResult: "Week 1" / "Month 2" / "Month 3"
- Each tab renders as a styled timeline with progress checkboxes

**Effort:** Medium | **Impact:** High

---

### Feature 10 — Application Progress Tracker

**What it does:**  
Each application card shows a visual progress bar: Applied → AI Screened → Reviewed → Shortlisted → Interview → Offer. The seeker can see exactly where they are in the pipeline at a glance.

**Why it matters:**  
Job seekers constantly wonder "What's happening with my application?" A visual tracker reduces anxiety and support questions.

**Backend:**
- No new backend needed — derive from existing application status + interview status
- Optionally add `lastViewedByEmployer` timestamp to track when employer opened the app

**Frontend:**
- Horizontal step indicator on MyApplications cards
- Active step highlighted, future steps grayed out
- Tooltip on each step showing date of transition

**Effort:** Low | **Impact:** High

---

## 🏢 Phase 4 — Enterprise & Professional Features

---

### Feature 11 — Kanban Hiring Board (Employer)

**What it does:**  
An employer views all applicants for a job as cards on a drag-and-drop kanban board with columns: Applied → Screening → Interview → Offer → Hired / Rejected. Dragging a card updates status automatically.

**Why it matters:**  
Industry standard ATS tools (Greenhouse, Lever, Workday) all use kanban. This is what HR professionals expect.

**Backend:**
- Add `stage` field to JobApplication (granular pipeline stage)
- `PATCH /api/employer/applications/{id}/stage`
- Valid stages: APPLIED, PHONE_SCREEN, INTERVIEW, OFFER, HIRED, REJECTED

**Frontend:**
- New `KanbanBoard.tsx` page under employer section
- HTML5 drag-and-drop (no external library)
- Column headers with count badges
- Smooth card transition animations

**Effort:** High | **Impact:** Medium-High

---

### Feature 12 — Employer Company Profile & Branded Career Page

**What it does:**  
Employers set up a company profile: logo, about text, website, industry, size, location. Job seekers see branding on listings. A public URL `/company/{slug}/jobs` shows all open positions — shareable on LinkedIn.

**Why it matters:**  
Brand trust matters. A branded listing with a logo gets 3x more applications than a bare listing. Public career page enables social sharing.

**Backend:**
- `CompanyProfile` entity: `slug`, `logo`, `about`, `website`, `industry`, `teamSize`, `location`
- `PUT /api/employer/company-profile`
- `GET /api/public/company/{slug}` (no auth required)
- `GET /api/public/company/{slug}/jobs`

**Frontend:**
- "Company Profile" settings page in Employer section with logo upload
- Job cards show company logo + name
- Public route `/company/:slug` accessible without login

**Effort:** Medium-High | **Impact:** Medium-High

---

### Feature 13 — Multi-Language Support (i18n)

**What it does:**  
The entire UI supports English and Hindi (extendable to more). A language toggle in the topbar switches all labels, buttons, and messages.

**Why it matters:**  
India-focused portals need Hindi support. i18n also demonstrates production-readiness for a college project.

**Backend:**
- No backend changes — i18n is frontend only
- Error messages can be localized via response codes

**Frontend:**
- Create `i18n/en.json` and `i18n/hi.json` translation files
- `LanguageContext` wrapping the app
- `useTranslation()` hook replacing all hardcoded strings
- Language toggle in AppShell topbar

**Effort:** High (many strings to extract) | **Impact:** Medium

---

### Feature 14 — Dark Mode Toggle

**What it does:**  
A sun/moon toggle in the topbar switches the entire app between light and dark themes. Preference is saved in localStorage.

**Why it matters:**  
Dark mode is an expected feature in modern apps. It demonstrates strong CSS architecture and improves accessibility.

**Backend:**
- No backend changes

**Frontend:**
- Duplicate CSS variables in `:root` and `[data-theme="dark"]`
- Dark palette: deep navy backgrounds, soft white text, adjusted accent colors
- Toggle component in AppShell topbar
- `localStorage.getItem('theme')` for persistence

**Effort:** Medium | **Impact:** Medium-High

---

## 🔒 Phase 5 — Security & Compliance

---

### Feature 15 — Two-Factor Authentication (2FA)

**What it does:**  
After login with email/password, users optionally enable 2FA. When enabled, login requires a TOTP code from an authenticator app (Google Authenticator, Authy).

**Why it matters:**  
Enterprise-grade security. Protects employer accounts that manage sensitive candidate data.

**Backend:**
- Add `twoFactorSecret` and `twoFactorEnabled` columns to User entity
- `POST /api/auth/2fa/setup` — returns QR code URL
- `POST /api/auth/2fa/verify` — validates TOTP code
- Modify login flow: if 2FA enabled, return `requires2FA: true` instead of JWT
- Use `com.warrenstrange:googleauth` library

**Frontend:**
- Settings page: "Enable 2FA" toggle → shows QR code modal
- Login page: conditional 6-digit TOTP input step (similar to OTP flow)

**Effort:** Medium-High | **Impact:** Medium

---

### Feature 16 — Data Retention & GDPR Controls (Admin)

**What it does:**  
Admin configures retention policies: "Delete applications older than 12 months", "Purge audit logs after 24 months", "Remove uploaded resumes after 6 months". A nightly scheduled task enforces the policy.

**Why it matters:**  
GDPR compliance requires data minimization. Even without legal obligation, cleanup keeps the database fast and reduces storage costs.

**Backend:**
- `RetentionPolicy` entity: `applicationRetentionDays`, `auditLogRetentionDays`, `resumeRetentionDays`
- `RetentionService` with `@Scheduled(cron = "0 0 2 * * *")` nightly job
- Audit log entry written before each batch delete
- `GET /PUT /api/admin/settings/retention`

**Frontend:**
- "Data Retention" settings panel in Admin section
- Slider/number inputs for retention periods
- Last cleanup timestamp + records cleaned count display

**Effort:** Medium | **Impact:** Medium

---

### Feature 17 — Password Reset via Email

**What it does:**  
A "Forgot Password?" link on the login page sends a time-limited password reset link to the user's email. Clicking the link opens a form to set a new password.

**Why it matters:**  
Basic auth feature expected by every user. Currently no way to recover a forgotten password.

**Backend:**
- `PasswordResetService` — generates UUID token, stores with expiry in DB or in-memory
- `POST /api/auth/forgot-password` — sends email with reset link
- `POST /api/auth/reset-password` — validates token + sets new password
- `EmailService.sendPasswordResetEmail()`

**Frontend:**
- "Forgot Password?" link on LoginPage
- ForgotPasswordPage: email input → sends reset link
- ResetPasswordPage: new password input → confirms reset

**Effort:** Low-Medium | **Impact:** High

---

## 💬 Phase 6 — Communication & Collaboration

---

### Feature 18 — In-App Messaging (Employer ↔ Candidate)

**What it does:**  
After shortlisting a candidate, the employer can send direct messages within the platform. The candidate can reply. Thread-based conversation history is preserved.

**Why it matters:**  
Currently communication happens off-platform (email only). In-app messaging keeps conversations tracked, auditable, and contextual.

**Backend:**
- `Message` entity: `senderId`, `receiverId`, `applicationId`, `content`, `createdAt`, `isRead`
- `MessageRepository` with pagination
- `MessageController`:
  - `GET /api/messages/threads` — list conversation threads
  - `GET /api/messages/thread/{applicationId}` — messages for an application
  - `POST /api/messages/send` — send message

**Frontend:**
- "Messages" nav item in employer and jobseeker sidebars
- Thread list page with unread indicators
- Conversation view with chat-style bubbles
- SSE integration for real-time message push

**Effort:** High | **Impact:** Medium-High

---

### Feature 19 — Interview Feedback & Rating

**What it does:**  
After an interview is marked COMPLETED, the employer fills out a feedback form: overall rating (1–5 stars), technical score, communication score, and notes. Job seekers can optionally see a summary.

**Why it matters:**  
Closes the feedback loop. Helps admins track interview quality. Enables data-driven hiring decisions.

**Backend:**
- `InterviewFeedback` entity: `interviewId`, `overallRating`, `technicalScore`, `communicationScore`, `notes`, `shareWithCandidate`
- `POST /api/interviews/{id}/feedback`
- `GET /api/interviews/{id}/feedback`

**Frontend:**
- Post-interview feedback form in EmployerInterviews
- Star rating component
- Optional candidate-visible summary card in MyInterviews

**Effort:** Medium | **Impact:** Medium-High

---

## 📱 Phase 7 — UX Polish & Performance

---

### Feature 20 — Mobile Responsive Navigation

**What it does:**  
On mobile/tablet, the sidebar collapses into a hamburger menu with slide-in overlay. All pages adapt to single-column layouts with touch-friendly tap targets.

**Why it matters:**  
40%+ of users browse on mobile. Currently the sidebar is hidden on mobile with no way to navigate.

**Backend:** None

**Frontend:**
- Hamburger toggle button in mobile topbar
- Sidebar slides in with backdrop overlay
- Touch-friendly nav links (min 44px tap targets)
- Card grids collapse to single column
- Tables become scrollable or card-based on mobile

**Effort:** Medium | **Impact:** Very High

---

### Feature 21 — Skeleton Loading States

**What it does:**  
Every page that fetches data shows beautiful skeleton placeholders (shimmer effect) matching the exact layout of the content. Currently some pages show basic skeleton, others show nothing during load.

**Why it matters:**  
Eliminates layout shift and perceived loading time. Professional feel.

**Backend:** None

**Frontend:**
- Create reusable `<Skeleton>` component with variants: card, table-row, stat-card, chart
- Apply to every page that has a loading state
- Ensure skeleton matches final layout dimensions exactly

**Effort:** Low-Medium | **Impact:** Medium

---

### Feature 22 — Global Search (Command Palette)

**What it does:**  
Press `Ctrl+K` anywhere in the app to open a search palette. Type to search across: jobs, users, applications, settings pages. Results are instant with keyboard navigation.

**Why it matters:**  
Power-user feature that makes the app feel like a premium SaaS product. Reduces clicks for frequently accessed pages.

**Backend:**
- `GET /api/search?q=` — searches across jobs, users (admin only)
- Returns unified search results with type, title, link

**Frontend:**
- `CommandPalette.tsx` — modal overlay with search input
- `Ctrl+K` / `Cmd+K` keyboard shortcut
- Grouped results: Jobs, Pages, Users
- Arrow key navigation + Enter to select

**Effort:** Medium | **Impact:** Medium

---

## Priority Matrix

| Phase | Features | Effort | Impact | Recommended Order |
|-------|----------|--------|--------|-------------------|
| **Phase 1** | AI Questions, ATS Score, Resume Tips, Cover Letter | Medium | 🔴 Very High | **Start here** |
| **Phase 2** | Hiring Funnel, Admin Analytics, Candidate Compare | Medium-High | 🔴 High | 2nd |
| **Phase 3** | Job Recommendations, 90-Day Roadmap, Progress Tracker | Medium | 🟡 High | 3rd |
| **Phase 4** | Kanban, Company Profile, i18n, Dark Mode | High | 🟡 Medium-High | 4th |
| **Phase 5** | 2FA, Data Retention, Password Reset | Medium | 🟡 Medium-High | 5th |
| **Phase 6** | Messaging, Interview Feedback | High | 🟡 Medium-High | 6th |
| **Phase 7** | Mobile Nav, Skeletons, Command Palette | Medium | 🟡 Medium | 7th |

---

## Recommended Starting Point

Start with **Phase 1, Feature 1 (AI Interview Question Generator)** — it reuses the existing Ollama integration and delivers immediate employer value with moderate effort.

Then do **Feature 17 (Password Reset)** — it's a must-have basic auth feature with low effort and high user impact.

---

## How To Use This File

1. Pick a feature from any phase
2. Tell the agent: "Implement Feature X from newfeatureplan.md"
3. The agent will read this spec, implement backend + frontend end-to-end
4. After completion, mark the feature as ✅ Done and update the status table at top

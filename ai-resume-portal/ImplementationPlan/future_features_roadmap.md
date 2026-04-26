# Future Features Roadmap
**Project:** AI Resume Screening Portal  
**Date:** 2026-04-26  
**Status:** Planning

---

## What Is Already Built (Current State)

Before adding anything new, here is what already works end-to-end:

| # | Feature | Status |
|---|---------|--------|
| 1 | Auth — Register / Login / JWT / Role-based routing | ✅ Done |
| 2 | Employer — Post Job / Manage Jobs / Close Job | ✅ Done |
| 3 | Job Seeker — Browse Jobs / Apply with Resume Upload | ✅ Done |
| 4 | AI Resume Screening — Score, Eligibility, Skill Gap | ✅ Done |
| 5 | 7-Day Learning Plan + YouTube recommendations | ✅ Done |
| 6 | Employer — View Applicants / Shortlist / Reject | ✅ Done |
| 7 | Interview Scheduling — Schedule / Reschedule / Cancel / Confirm / Decline | ✅ Done |
| 8 | In-App Notifications — Bell panel, mark read | ✅ Done |
| 9 | Saved Jobs — Bookmark and manage saved jobs | ✅ Done |
| 10 | Profile Page — View and edit user profile | ✅ Done |
| 11 | Super Admin — Dashboard, User Management, All Jobs, All Applicants, Screening Reports | ✅ Done |
| 12 | Live Dashboard Metrics — Employer and Job Seeker stats | ✅ Done |
| 13 | SMTP Email — Welcome, Application, Status, Interview emails via Gmail | ✅ Done |

---

## Sprint 1 — High Impact, Visible Features

These features will make the product feel complete and production-ready to users immediately.

---

### Feature 1 — Candidate Ranking Leaderboard

**What it does:**  
When an employer opens applicants for a job, they see candidates ranked #1, #2, #3... by combined AI match score + skill match percentage. The best candidate is always at the top.

**Why it matters:**  
Employers don't have time to read through 50 applications manually. A ranked list saves hours.

**Backend tasks:**
- In `ApplicationService`, add `getRankedApplicants(Long jobId)` method that fetches applications for a job and sorts by `screeningResult.matchScore DESC`
- Add `rank` field to `ApplicationResponse` DTO (sequential position in sorted list)
- Add endpoint: `GET /api/employer/jobs/{jobId}/rankings`

**Frontend tasks:**
- In `ViewApplicants.tsx`, add a "Ranked View" tab toggle (alongside existing list)
- Show rank badge `#1`, `#2`... next to each applicant card
- Highlight top 3 with gold/silver/bronze color border

**API:** `GET /api/employer/jobs/{jobId}/rankings`

---

### Feature 2 — Audit Logs

**What it does:**  
Every important action in the system (user created, job posted, application shortlisted, interview scheduled, user deactivated) is recorded in an `audit_log` table with who did it, what they did, when, and on what object.

**Why it matters:**  
Admins need accountability. If something goes wrong (wrong rejection, spam jobs), the admin can trace exactly what happened and who did it.

**Backend tasks:**
- Create `AuditLog` entity: `id`, `actorId`, `actorEmail`, `action` (enum: USER_CREATED, JOB_POSTED, APPLICATION_UPDATED, INTERVIEW_SCHEDULED, USER_DEACTIVATED...), `targetType`, `targetId`, `detail` (JSON string), `createdAt`
- Create `AuditLogRepository` and `AuditLogService.log()`
- Call `auditLogService.log(...)` in: `AuthService.register()`, `JobService.createJob()`, `ApplicationService.updateApplicationStatus()`, `InterviewService.scheduleInterview()`, `AdminService.setUserStatus()`
- Add admin endpoint: `GET /api/admin/audit-logs?page=0&size=20&action=&actorId=`

**Frontend tasks:**
- Add `Audit Logs` page under Admin section
- Show table: Date | Actor | Action | Target | Detail
- Add filter dropdown for action type

**API:** `GET /api/admin/audit-logs`

---

### Feature 3 — CSV / PDF Export

**What it does:**  
Admin and employers can export their data as downloadable CSV or PDF files.
- Admin: export all users, all applications, screening report
- Employer: export their applicants for a specific job

**Why it matters:**  
Real HR teams need to work in Excel/Google Sheets. This is a basic expectation for any hiring product.

**Backend tasks:**
- Add `ExportService` with methods: `exportApplicationsAsCsv(Long jobId)`, `exportUsersAsCsv()`, `exportScreeningReportAsCsv()`
- Use Apache Commons CSV (add to pom.xml) for CSV generation
- Use iText or OpenPDF (add to pom.xml) for PDF generation
- Add endpoints:
  - `GET /api/admin/export/users?format=csv`
  - `GET /api/admin/export/applications?format=csv`
  - `GET /api/employer/jobs/{jobId}/export/applicants?format=csv|pdf`
- Set `Content-Disposition: attachment` response header

**Frontend tasks:**
- Add Export button (with CSV/PDF dropdown) in Admin pages: UserManagement, AllApplicants
- Add Export button in Employer `ViewApplicants` page
- Trigger file download using `window.open(url)` or blob response

---

### Feature 4 — Real-Time Notifications via SSE

**What it does:**  
Currently notifications are polled (user refreshes or navigates to see new ones). With SSE (Server-Sent Events), the bell badge updates instantly without any refresh when a new notification arrives.

**Why it matters:**  
Adds a modern, live feel. A job seeker gets an instant ping when shortlisted. An employer sees confirmation the moment an interview is accepted.

**Backend tasks:**
- Add `SseController` with endpoint: `GET /api/notifications/stream` using `SseEmitter`
- Store active emitters in a `ConcurrentHashMap<Long userId, SseEmitter>`
- In `NotificationService.send()`, after saving to DB, push the new notification to the user's active emitter if present
- Handle emitter timeout and cleanup

**Frontend tasks:**
- In `AppShell.tsx` (or `NotificationsPage.tsx`), open an `EventSource` on mount pointed at `/api/notifications/stream`
- On incoming SSE event, increment the bell badge count and add notification to local state
- Close the EventSource on unmount

---

## Sprint 2 — AI Intelligence Upgrades

These features directly improve the core AI value proposition of the product.

---

### Feature 5 — AI Interview Question Generator

**What it does:**  
For any application, the system uses the job description + the candidate's resume skills to generate 10 tailored interview questions (split into Technical, Behavioral, and Situational categories).

**Why it matters:**  
Employers currently have to prepare questions manually. Auto-generating smart questions saves prep time and ensures every candidate is evaluated consistently.

**Backend tasks:**
- Add `InterviewQuestionService.generateQuestions(Long applicationId)` that:
  1. Fetches job description and candidate's resume skills from `ScreeningResult`
  2. Builds an Ollama prompt: "Given this job description and candidate skills, generate 10 interview questions..."
  3. Parses and returns structured list: `[{category: "Technical", question: "..."}, ...]`
- Cache result in a new `InterviewQuestion` entity so it's not regenerated on every call
- Add endpoint: `GET /api/applications/{id}/interview-questions`

**Frontend tasks:**
- In Employer `ViewApplicants`, add "Generate Questions" button per applicant card
- Show questions in a modal grouped by category (Technical / Behavioral / Situational)
- Add copy-all button for employer convenience

---

### Feature 6 — Resume ATS Score

**What it does:**  
Before submitting an application, a job seeker can get an ATS (Applicant Tracking System) readiness score for their resume. The system checks: keyword density, formatting signals, resume length, section presence (Education, Experience, Skills), and contact info completeness.

**Why it matters:**  
Many real companies filter resumes through ATS software before a human ever sees them. Teaching job seekers how ATS-ready their resume is adds enormous practical value.

**Backend tasks:**
- Add `AtsScoreService.score(String resumeText)` that checks:
  - Has keywords matching job description (score 0–30)
  - Resume length appropriate 300–800 words (score 0–10)
  - Contains sections: Education, Experience, Skills (score 0–30)
  - Contact info present: email, phone (score 0–15)
  - No tables/columns (ATS-unfriendly formatting) (score 0–15)
- Return `AtsScoreResponse { totalScore, breakdown: {keywords, length, sections, contact, formatting}, tips: [...] }`
- Add endpoint: `POST /api/jobseeker/resume/ats-score` (accepts resume file upload)

**Frontend tasks:**
- In `ApplyJob.tsx`, after resume upload add an "Check ATS Score" button
- Show score gauge (0–100) with colour (Red <50 / Yellow 50–75 / Green >75)
- List improvement tips from response

---

### Feature 7 — Resume Improvement Tips

**What it does:**  
After a job seeker sees their screening result, an AI-powered panel suggests exactly how to improve their resume for that specific job — e.g., "Add Docker to your skills section", "Your experience section lacks quantified achievements".

**Why it matters:**  
The current screening result shows what's missing. This feature goes further and tells the candidate *how* to fix it, making the platform much more useful than a simple pass/fail gate.

**Backend tasks:**
- Add `ResumeTipsService.generateTips(Long applicationId)` using Ollama:
  - Prompt includes job description, matched skills, missing skills, resume text
  - Returns list of 5 bullet-point actionable improvements
- Cache in `resume_tips` column on `ScreeningResult` entity (or a separate table)
- Add endpoint: `GET /api/jobseeker/applications/{id}/resume-tips`

**Frontend tasks:**
- In `ScreeningResult.tsx`, add a "How To Improve" collapsible panel
- Show each tip as a styled bullet with an icon (lightbulb or arrow)

---

### Feature 8 — Hiring Funnel Analytics (Employer Dashboard)

**What it does:**  
On the employer dashboard, a visual funnel chart shows: Applied → Screened → Shortlisted → Interviewed → Hired. Each stage shows the count and the drop-off percentage from the stage above.

**Why it matters:**  
Helps employers understand where candidates are dropping off. If 90% get rejected at screening, the job description might be unrealistic. If 80% decline interviews, something else is wrong.

**Backend tasks:**
- Add `getFunnelStats(Long employerId)` in `ApplicationService` that counts applications at each status: PENDING, SCREENED, SHORTLISTED, INTERVIEWED (new status), HIRED (new status)
- Add `INTERVIEWED` and `HIRED` to `ApplicationStatus` enum
- Add endpoint: `GET /api/employer/jobs/{jobId}/funnel`

**Frontend tasks:**
- In Employer `Dashboard.tsx`, add a funnel visualization below the stat cards
- Use a simple HTML/CSS stepped bar (no external chart library needed)
- Each step shows the stage name, count, and % of previous stage

---

## Sprint 3 — Job Seeker Experience Upgrades

---

### Feature 9 — 30/60/90 Day Career Path

**What it does:**  
Extends the existing 7-day learning plan into a 30/60/90-day roadmap. Week 1–4 covers basics of missing skills. Month 2 covers intermediate projects. Month 3 covers advanced practice + portfolio building + job re-application.

**Why it matters:**  
A 7-day plan feels like a quick fix. A 90-day plan makes the platform feel like a career coach, not just a screening tool.

**Backend tasks:**
- Extend `LearningPlan` entity with `month1Plan`, `month2Plan`, `month3Plan` text fields
- Modify AI prompt in `LearningPlanService` to request a structured 90-day response
- Parse response into 3-month sections
- Add field to `LearningPlanResponse` DTO
- No new endpoint needed — extend existing `GET /api/ai/learning-plan/{applicationId}`

**Frontend tasks:**
- In `ScreeningResult.tsx`, replace current 7-day plan panel with a tabbed `Week 1` / `Month 2` / `Month 3` view
- Each tab shows the plan as styled timeline steps

---

### Feature 10 — Application Withdrawal

**What it does:**  
A job seeker can withdraw their own application before an employer takes any action on it (while status is still PENDING or SCREENED).

**Why it matters:**  
Job seekers sometimes apply by accident or find a better opportunity. Without withdrawal, they have to leave zombie applications open forever.

**Backend tasks:**
- Add `withdrawApplication(Long applicationId, Authentication auth)` in `ApplicationService`
- Only allowed if `application.status == PENDING || SCREENED`
- Set `application.status = WITHDRAWN` (add to enum)
- Add endpoint: `DELETE /api/applications/{id}` (or `PATCH /api/applications/{id}/withdraw`)
- Send email confirmation: "Your application for [Job Title] has been withdrawn"

**Frontend tasks:**
- In `MyApplications.tsx`, add "Withdraw" button on PENDING/SCREENED application cards
- Show confirm dialog before withdrawing
- Remove card from list after successful withdrawal

---

### Feature 11 — Job Recommendations

**What it does:**  
On the Job Seeker dashboard and Browse Jobs page, a "Recommended For You" section shows jobs that best match the skills extracted from the user's most recent uploaded resume or profile skills.

**Why it matters:**  
Browsing all jobs manually is slow. Smart recommendations make the platform feel intelligent and personalized.

**Backend tasks:**
- Add `JobRecommendationService.getRecommendations(Long userId)`:
  1. Get the user's skills from their latest `ScreeningResult` matched_skills, or from `User.skills` profile field
  2. For each active job, compute overlap with job's `requiredSkills`
  3. Return top 5 jobs sorted by overlap count DESC
- Add endpoint: `GET /api/jobseeker/recommended-jobs`

**Frontend tasks:**
- In `BrowseJobs.tsx`, add a "Recommended For You" horizontal scroll section at the top
- Each recommended job card shows a "Match" badge with percentage

---

## Sprint 4 — Enterprise and Trust Features

---

### Feature 12 — Side-by-Side Candidate Comparison

**What it does:**  
An employer selects two applicants and clicks "Compare". A side-by-side panel shows both candidates' AI scores, matched skills, missing skills, experience, and education in aligned columns.

**Why it matters:**  
When making a final hiring decision between two strong candidates, a comparison view eliminates back-and-forth clicking.

**Backend tasks:**
- Add `compareApplications(Long appAId, Long appBId, Authentication auth)` in `ApplicationService`
- Return `CompareResponse { applicantA: CandidateSummary, applicantB: CandidateSummary }` where `CandidateSummary` has name, score, matchedSkills, missingSkills, experience, education
- Add endpoint: `GET /api/employer/compare?appA={id}&appB={id}`

**Frontend tasks:**
- In `ViewApplicants.tsx`, add checkbox selection on applicant cards
- When exactly 2 are selected, show "Compare Selected" button
- Open a modal with two-column layout showing both candidates side-by-side
- Highlight fields where one candidate is stronger

---

### Feature 13 — Kanban Hiring Board

**What it does:**  
An employer can drag and drop applicant cards between stage columns: Applied → Screening → Interview → Offer → Hired / Rejected. Each move updates the application status in the database.

**Why it matters:**  
Most modern ATS tools (Greenhouse, Lever) have a kanban board. This is what real hiring teams expect.

**Backend tasks:**
- Add `stage` field to `JobApplication` entity (separate from `status`, more granular)
- Add `updateStage(Long applicationId, String stage, Authentication auth)` in `ApplicationService`
- Add endpoint: `PATCH /api/employer/applications/{id}/stage`

**Frontend tasks:**
- Create new page `KanbanBoard.tsx` under employer section
- Use CSS grid for column layout (no external DnD library — use HTML5 drag events)
- Each column: Applied, Phone Screen, Interview, Offer, Hired, Rejected
- Dragging a card calls the stage update API

---

### Feature 14 — Data Retention and Privacy Controls (Admin)

**What it does:**  
Admin can set a retention policy (e.g., "delete all applications older than 12 months"). A scheduled Spring task runs nightly and cleans up old records according to the policy. Deleted records are logged in the audit log before deletion.

**Why it matters:**  
GDPR compliance requires data minimization. Even without legal obligation, cleaning old data keeps the database performant.

**Backend tasks:**
- Create `RetentionPolicy` entity: `applicationRetentionDays`, `auditLogRetentionDays`, `resumeFileRetentionDays`, `updatedAt`, `updatedBy`
- Add `RetentionService` with `@Scheduled(cron = "0 2 * * *")` cleanup method
- Before deleting any record, write to audit log
- Add admin endpoints: `GET /api/admin/settings/retention` and `PUT /api/admin/settings/retention`

**Frontend tasks:**
- Add "Data Retention" settings panel in Admin section
- Show current policy values with edit form
- Show last cleanup timestamp and records cleaned count

---

### Feature 15 — Employer Company Profile / Branded Career Page

**What it does:**  
Employers can set up a company profile with logo, about text, website, and location. Job seekers see the company branding on each job listing. A public URL (`/company/{slug}/jobs`) shows all open jobs from that employer — shareable on LinkedIn.

**Why it matters:**  
Brand trust matters for applicants. A job posting with a logo and company description gets more serious applicants than a bare listing.

**Backend tasks:**
- Add `CompanyProfile` entity linked to employer `User`: `companyName`, `logo` (file upload), `about`, `website`, `location`, `slug` (auto-generated from company name)
- Add `CompanyProfileController` with:
  - `PUT /api/employer/company-profile` (update)
  - `GET /api/public/company/{slug}` (public, no auth)
  - `GET /api/public/company/{slug}/jobs` (public job listings)

**Frontend tasks:**
- Add "Company Profile" page in Employer section with logo upload + form
- Update job cards throughout the app to show company logo + name
- Add public route `/company/:slug` accessible without login

---

## Priority Summary

| Sprint | Features | Effort | Impact |
|--------|----------|--------|--------|
| Sprint 1 | Candidate Ranking, Audit Logs, CSV/PDF Export, Real-Time SSE Notifications | Medium | Very High |
| Sprint 2 | AI Interview Questions, ATS Score, Resume Tips, Hiring Funnel | Medium-High | High |
| Sprint 3 | 90-Day Career Path, Application Withdrawal, Job Recommendations | Low-Medium | High |
| Sprint 4 | Compare Candidates, Kanban Board, Data Retention, Company Profile | High | Medium-High |

---

## Suggested Starting Point

Start with **Sprint 1, Feature 1 (Candidate Ranking)** — it is pure backend sorting logic with minimal frontend changes and immediately makes the employer experience better.

Then do **Feature 4 (Real-Time SSE Notifications)** — it upgrades an already-built feature (notifications exist, just need live push) and is visually impressive.

---

## How To Use This File

When you are ready to implement any feature:
1. Tell the agent: "implement Feature X from future_features_roadmap.md"
2. The agent will read this file, understand the full scope, and implement backend + frontend end-to-end
3. After completion, mark the feature as ✅ Done in this file and update the "What Is Already Built" table at the top

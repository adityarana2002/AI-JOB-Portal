# AI Resume Screening Job Portal - Features

## Super Simple Version (Easy To Understand)

If we explain this project in very simple words:

- It is a job portal with AI.
- Employers post jobs.
- Job seekers apply with their resume.
- AI checks how well the resume matches the job.
- The system gives a score and tells if candidate is eligible.
- If candidate is not eligible, system gives missing skills and a learning plan.
- Admin can see and control everything.

Think of it like this:

1. Post job.
2. Apply job.
3. AI checks resume.
4. See result and next steps.

Main value in one line:
- Faster hiring for companies and better guidance for students/job seekers.

## Why This Project Was Created

This project was created to solve a real hiring problem:
- Employers spend too much manual effort screening resumes.
- Job seekers often do not know why they were rejected.
- Admins need one place to monitor users, jobs, applications, and AI outcomes.

The core purpose is to build an AI-powered job platform where resume screening is automated and transparent. Instead of only giving pass/fail, the system also gives skill-gap feedback and a 7-day learning path.

Primary intent source:
- [implementation_plan.md](implementation_plan.md)
- [ai-resume-portal/ImplementationPlan/phase1.md](ai-resume-portal/ImplementationPlan/phase1.md)
- [ai-resume-portal/ImplementationPlan/phase10.md](ai-resume-portal/ImplementationPlan/phase10.md)

## Product Vision In One Flow

1. Employer posts a job.
2. Job seeker uploads resume and applies.
3. Backend parses resume text.
4. AI scores match and marks eligibility.
5. If not eligible, AI generates a learning plan and YouTube learning recommendations.
6. Employer and job seeker can view screening results.
7. Super Admin monitors full system activity.

## Feature Catalog (What Each Feature Does)

## 1) Authentication and Access Control

Feature: User registration and login with JWT
- What it does: Creates user accounts for EMPLOYER, JOB_SEEKER, and SUPER_ADMIN flows; returns token for authenticated requests.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/auth/controller/AuthController.java](ai-resume-portal/backend/src/main/java/com/portal/auth/controller/AuthController.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/auth/service/AuthService.java](ai-resume-portal/backend/src/main/java/com/portal/auth/service/AuthService.java)
  - [ai-resume-portal/frontend/src/context/AuthContext.tsx](ai-resume-portal/frontend/src/context/AuthContext.tsx)

Feature: Role-based authorization
- What it does: Protects modules by role and blocks unauthorized actions (example: AI test endpoint only for super admin).
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/config/SecurityConfig.java](ai-resume-portal/backend/src/main/java/com/portal/config/SecurityConfig.java)
  - [ai-resume-portal/frontend/src/routes/AppRouter.tsx](ai-resume-portal/frontend/src/routes/AppRouter.tsx)
  - [ai-resume-portal/frontend/src/routes/routeUtils.ts](ai-resume-portal/frontend/src/routes/routeUtils.ts)

## 2) Employer Features

Feature: Post job
- What it does: Employer creates job with title, description, required skills, location, type, and deadline.
- Main files:
  - [ai-resume-portal/frontend/src/pages/employer/PostJob.tsx](ai-resume-portal/frontend/src/pages/employer/PostJob.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/job/controller/JobController.java](ai-resume-portal/backend/src/main/java/com/portal/job/controller/JobController.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/job/service/JobService.java](ai-resume-portal/backend/src/main/java/com/portal/job/service/JobService.java)

Feature: Manage own jobs
- What it does: Employer lists their jobs and closes jobs via soft delete (isActive false).
- Main files:
  - [ai-resume-portal/frontend/src/pages/employer/MyJobs.tsx](ai-resume-portal/frontend/src/pages/employer/MyJobs.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/job/service/JobService.java](ai-resume-portal/backend/src/main/java/com/portal/job/service/JobService.java)

Feature: View applicants per job
- What it does: Employer views all applicants for jobs they own.
- Main files:
  - [ai-resume-portal/frontend/src/pages/employer/ViewApplicants.tsx](ai-resume-portal/frontend/src/pages/employer/ViewApplicants.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java](ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java)

## 3) Job Seeker Features

Feature: Browse jobs
- What it does: Job seeker sees active jobs and navigates to apply.
- Main files:
  - [ai-resume-portal/frontend/src/pages/jobseeker/BrowseJobs.tsx](ai-resume-portal/frontend/src/pages/jobseeker/BrowseJobs.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/job/controller/JobController.java](ai-resume-portal/backend/src/main/java/com/portal/job/controller/JobController.java)

Feature: Apply with resume upload
- What it does: Job seeker uploads resume (PDF) and optional cover letter.
- Main files:
  - [ai-resume-portal/frontend/src/pages/jobseeker/ApplyJob.tsx](ai-resume-portal/frontend/src/pages/jobseeker/ApplyJob.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/application/controller/ApplicationController.java](ai-resume-portal/backend/src/main/java/com/portal/application/controller/ApplicationController.java)

Feature: Track applications
- What it does: Job seeker lists submitted applications and status.
- Main files:
  - [ai-resume-portal/frontend/src/pages/jobseeker/MyApplications.tsx](ai-resume-portal/frontend/src/pages/jobseeker/MyApplications.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java](ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java)

Feature: View AI screening result
- What it does: Shows match score, eligibility, matched/missing skills, strengths, weaknesses, summary, learning plan, and YouTube recommendations.
- Main files:
  - [ai-resume-portal/frontend/src/pages/jobseeker/ScreeningResult.tsx](ai-resume-portal/frontend/src/pages/jobseeker/ScreeningResult.tsx)
  - [ai-resume-portal/backend/src/main/java/com/portal/application/dto/ScreeningResultResponse.java](ai-resume-portal/backend/src/main/java/com/portal/application/dto/ScreeningResultResponse.java)

## 4) AI Screening Features (Core Differentiator)

Feature: Resume parsing with Apache Tika
- What it does: Extracts plain text from uploaded resume file.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/resume/service/ResumeParsingService.java](ai-resume-portal/backend/src/main/java/com/portal/resume/service/ResumeParsingService.java)

Feature: AI screening prompt
- What it does: Compares resume text against job requirements and returns structured evaluation.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java](ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/prompt/PromptTemplates.java](ai-resume-portal/backend/src/main/java/com/portal/ai/prompt/PromptTemplates.java)

Feature: Learning plan generation (when not eligible)
- What it does: Produces day-by-day improvement plan focused on missing skills.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java](ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java)

Feature: YouTube recommendation generation
- What it does: Suggests channel + query to quickly start learning missing skills.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java](ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java)

Feature: Robust JSON sanitization
- What it does: Cleans LLM response and extracts JSON when model returns extra text/markdown wrappers.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java](ai-resume-portal/backend/src/main/java/com/portal/ai/service/AiScreeningService.java)

Feature: End-to-end auto screening on apply
- What it does: Apply action immediately triggers parse + AI + DB persist in one backend flow.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java](ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java)

## 5) Super Admin Features

Feature: Dashboard metrics
- What it does: Shows total users, jobs, applications, and screening count.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/admin/service/AdminService.java](ai-resume-portal/backend/src/main/java/com/portal/admin/service/AdminService.java)
  - [ai-resume-portal/frontend/src/pages/admin/Dashboard.tsx](ai-resume-portal/frontend/src/pages/admin/Dashboard.tsx)

Feature: User management (activate/deactivate)
- What it does: Admin can disable/enable user accounts.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/admin/controller/AdminController.java](ai-resume-portal/backend/src/main/java/com/portal/admin/controller/AdminController.java)
  - [ai-resume-portal/frontend/src/pages/admin/UserManagement.tsx](ai-resume-portal/frontend/src/pages/admin/UserManagement.tsx)

Feature: Global monitoring pages
- What it does: Admin can inspect all jobs, all applications, and all screening reports.
- Main files:
  - [ai-resume-portal/frontend/src/pages/admin/AllJobs.tsx](ai-resume-portal/frontend/src/pages/admin/AllJobs.tsx)
  - [ai-resume-portal/frontend/src/pages/admin/AllApplicants.tsx](ai-resume-portal/frontend/src/pages/admin/AllApplicants.tsx)
  - [ai-resume-portal/frontend/src/pages/admin/ScreeningReports.tsx](ai-resume-portal/frontend/src/pages/admin/ScreeningReports.tsx)

## 6) Platform and Infrastructure Features

Feature: MySQL persistence with JPA entities
- What it does: Stores users, jobs, applications, and screening results.
- Main files:
  - [ai-resume-portal/backend/src/main/resources/application.yml](ai-resume-portal/backend/src/main/resources/application.yml)
  - [ai-resume-portal/backend/src/main/java/com/portal/user/entity/User.java](ai-resume-portal/backend/src/main/java/com/portal/user/entity/User.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/job/entity/Job.java](ai-resume-portal/backend/src/main/java/com/portal/job/entity/Job.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/application/entity/JobApplication.java](ai-resume-portal/backend/src/main/java/com/portal/application/entity/JobApplication.java)
  - [ai-resume-portal/backend/src/main/java/com/portal/ai/entity/ScreeningResult.java](ai-resume-portal/backend/src/main/java/com/portal/ai/entity/ScreeningResult.java)

Feature: Resume file storage
- What it does: Stores uploaded resumes in local uploads directory and returns stored file path.
- Main files:
  - [ai-resume-portal/backend/src/main/java/com/portal/resume/service/ResumeStorageService.java](ai-resume-portal/backend/src/main/java/com/portal/resume/service/ResumeStorageService.java)

Feature: Frontend API client with token interceptor
- What it does: Automatically attaches JWT token in outgoing requests.
- Main files:
  - [ai-resume-portal/frontend/src/services/api.ts](ai-resume-portal/frontend/src/services/api.ts)

## Features Mapped To Implementation Phases

- Phase 1-2: Core setup, DB model, repositories.
- Phase 3: Auth and JWT security.
- Phase 4: Employer job CRUD.
- Phase 5: Application + resume upload/parsing.
- Phase 6: AI model integration and structured response parsing.
- Phase 7: End-to-end apply-to-screen flow with DB persistence.
- Phase 8: Frontend auth, layouts, protected routing.
- Phase 9: Employer and job seeker full pages with API integration.
- Phase 10: Super admin management and monitoring module.

Source:
- [ai-resume-portal/ImplementationPlan/phase1.md](ai-resume-portal/ImplementationPlan/phase1.md)
- [ai-resume-portal/ImplementationPlan/phase2.md](ai-resume-portal/ImplementationPlan/phase2.md)
- [ai-resume-portal/ImplementationPlan/phase3.md](ai-resume-portal/ImplementationPlan/phase3.md)
- [ai-resume-portal/ImplementationPlan/phase4.md](ai-resume-portal/ImplementationPlan/phase4.md)
- [ai-resume-portal/ImplementationPlan/phase5.md](ai-resume-portal/ImplementationPlan/phase5.md)
- [ai-resume-portal/ImplementationPlan/phase6.md](ai-resume-portal/ImplementationPlan/phase6.md)
- [ai-resume-portal/ImplementationPlan/phase7.md](ai-resume-portal/ImplementationPlan/phase7.md)
- [ai-resume-portal/ImplementationPlan/phase8.md](ai-resume-portal/ImplementationPlan/phase8.md)
- [ai-resume-portal/ImplementationPlan/phase9.md](ai-resume-portal/ImplementationPlan/phase9.md)
- [ai-resume-portal/ImplementationPlan/phase10.md](ai-resume-portal/ImplementationPlan/phase10.md)

## Current Notes (Important)

- Employer and job seeker dashboard cards currently show static numbers in UI and can be upgraded to live API metrics.
  - [ai-resume-portal/frontend/src/pages/employer/Dashboard.tsx](ai-resume-portal/frontend/src/pages/employer/Dashboard.tsx)
  - [ai-resume-portal/frontend/src/pages/jobseeker/Dashboard.tsx](ai-resume-portal/frontend/src/pages/jobseeker/Dashboard.tsx)
- Screening is currently triggered inside apply flow (synchronous server-side sequence).
  - [ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java](ai-resume-portal/backend/src/main/java/com/portal/application/service/ApplicationService.java)

## Final Summary

This project is not only a job portal. It is a guided AI hiring and upskilling platform.

Main value delivered:
- Faster hiring decisions for employers.
- Actionable feedback and learning direction for job seekers.
- Full governance visibility for super admin.

## Professional Feature Upgrade Ideas (Cool Additions)

These are strong features you can add to make the product look much more professional.

## 1) Smart Hiring Intelligence

- Candidate ranking leaderboard per job with explainable reasons.
- AI confidence score (High, Medium, Low) for each screening result.
- Skill heatmap that shows strongest and weakest skills across all applicants.
- Hiring funnel analytics: Applied -> Screened -> Shortlisted -> Interviewed -> Hired.

## 2) Better Employer Workflow

- Kanban hiring board (New, Reviewed, Shortlisted, Rejected, Interview).
- Side by side resume comparison for top candidates.
- One click interview scheduling with calendar sync (Google/Outlook).
- Email template automation (shortlist, reject, interview invite).

## 3) Better Job Seeker Experience

- Resume ATS score before applying.
- Instant resume improvement tips (bullet rewrite suggestions).
- Portfolio booster: import GitHub/LinkedIn and generate profile summary.
- Career path mode: 30/60/90 day roadmap based on missing skills.

## 4) Advanced AI Features

- AI generated interview questions based on job + resume.
- Mock interview practice mode with feedback.
- Duplicate/fake resume detection and risk alert.
- Bias check report to ensure fair screening output.

## 5) Enterprise and Trust Features

- Full audit logs (who changed what and when).
- Role based report exports (CSV/PDF).
- Data retention and privacy controls.
- SLA monitoring and alerting for AI/API failures.

## 6) Product Polish Features

- Real time notifications (in app + email).
- Public company career page with branding.
- Multi language UI (English + regional language support).
- Accessibility mode (WCAG friendly fonts, contrast, keyboard support).

## Suggested Rollout (Professional Planning)

1. Phase A (Quick Wins): ranking leaderboard, Kanban board, notifications.
2. Phase B (AI Depth): interview questions, ATS score, resume improvement tips.
3. Phase C (Enterprise): audit logs, exports, privacy controls, SLA alerts.

# AI Resume Portal - Project Analysis and Feature Gap Report

Date: 2026-04-26
Scope: Full workspace review of backend, frontend, and implementation plan documents.

## 1. Why This Project Is Being Created

This project is built to solve a real hiring pain point for both companies and job seekers.

- Employers spend too much time manually screening resumes.
- Job seekers usually get rejection without clear feedback.
- Admins need centralized visibility over platform activity and AI outcomes.

The product goal is to create an AI-assisted hiring platform where:

1. Employer posts job.
2. Job seeker applies with resume.
3. System parses resume and runs AI screening.
4. Platform returns match score, eligibility, strengths, weaknesses, and missing skills.
5. If candidate is not eligible, system also gives a learning path and YouTube guidance.

In short: this is not only a job portal, it is a hiring + skill-improvement platform.

## 2. What I See in the Current Project (Current State)

## 2.1 Architecture and Stack

- Backend: Spring Boot 3.2.5, Java 21, Spring Security, JWT, Spring Data JPA, MySQL, Spring AI (Ollama), Apache Tika.
- Frontend: React + TypeScript + Vite + React Router + Axios.
- AI model setup: Ollama with deepseek-coder:6.7b.
- Storage: Local file storage for resumes (uploads folder).

## 2.2 Product Roles

- SUPER_ADMIN
- EMPLOYER
- JOB_SEEKER

Role-based access is enforced in both frontend routing and backend service/security layers.

## 2.3 Backend Modules Present

- Authentication and JWT module.
- Job CRUD module.
- Application and resume upload module.
- Resume parsing module (Apache Tika).
- AI screening module (prompt templates + parsing + learning recommendations).
- Admin module (dashboard and oversight APIs).
- Candidate ranking endpoint per job.

## 2.4 Frontend Modules Present

- Auth pages: login/register.
- Role-based protected routing and role layouts.
- Employer pages: dashboard, post job, my jobs, ranked applicants.
- Job seeker pages: dashboard, browse jobs, apply job, my applications, screening result.
- Admin pages: dashboard, users, all jobs, all applications, screening reports.
- Shared service layer for API communication.

## 2.5 Endpoint Surface (Implemented)

- Auth:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me
- Jobs:
  - POST /api/jobs
  - GET /api/jobs
  - GET /api/jobs/my-jobs
  - GET /api/jobs/{id}
  - GET /api/jobs/{id}/applicants
  - GET /api/jobs/{id}/rankings
  - PUT /api/jobs/{id}
  - DELETE /api/jobs/{id}
- Applications:
  - POST /api/applications/{jobId}/apply (multipart)
  - GET /api/applications/my-applications
  - GET /api/applications/{id}
  - GET /api/applications/{id}/screening
- Admin:
  - GET /api/admin/dashboard
  - GET /api/admin/users
  - PUT /api/admin/users/{id}/status
  - GET /api/admin/jobs
  - GET /api/admin/applications
  - GET /api/admin/screenings
- AI test:
  - POST /api/ai/test (super admin role)
- Health:
  - GET /api/health

## 3. Feature Status - What Is Done vs Left

## 3.1 Fully Implemented (MVP Core)

- User registration, login, JWT auth, and profile bootstrap.
- Role-based route protection in frontend.
- Role-based backend authorization checks.
- Employer job CRUD with ownership and soft delete.
- Job browsing for seekers.
- Resume upload and storage.
- Resume text extraction using Apache Tika.
- AI screening on apply flow.
- Screening persistence with score, eligibility, skills, strengths/weaknesses, summary.
- Learning plan and YouTube recommendations for skill gaps.
- Admin monitoring pages and user status toggle.
- Candidate ranking API + ranked applicant view.

## 3.2 Partially Implemented or Needs Improvement

- Dashboards are partly static:
  - Employer and job seeker dashboard cards show hardcoded values, not full live metrics.
- Application lifecycle states exist (PENDING, SCREENING, SCREENED, SHORTLISTED, REJECTED), but there is no complete workflow UI/API for employers to move candidates through all stages.
- Health endpoint still includes phase-specific temporary note and comment indicating future cleanup.
- Placeholder page component exists but is not currently used in routes.

## 3.3 Left Now (Important Gaps)

These are the main remaining features and quality gaps based on current code state.

## A) Product Workflow Gaps

- No interview scheduling flow (entity + API + UI).
- No employer action workflow for shortlist/reject/interview transitions.
- No job seeker profile/resume management section (update profile, upload multiple resumes, versioning).
- No notification system (in-app, email, or real-time updates).
- No public company career page or employer branding pages.

## B) AI and Insight Gaps

- No AI confidence score on screening output.
- No bias/fairness audit reports.
- No ATS score checker before applying.
- No AI interview question generator.
- No duplicate/fake resume detection.

## C) Admin and Enterprise Gaps

- No audit log module for critical actions.
- No data export (CSV/PDF).
- No retention policy and data cleanup policy module.
- No SLA/latency/availability monitoring dashboard.

## D) Security and Production Hardening Gaps

- JWT secret is configured directly in application.yml (should be environment-based secret management).
- Local credentials (MySQL username/password) are hardcoded in config.
- JPA ddl-auto is set to update (not ideal for production schema governance).
- SQL and debug logging enabled globally (not ideal for production).
- No refresh token / token revocation / device session management.
- No forgot-password and email verification flow.
- No backend-level strict MIME validation and antivirus scanning for uploaded files.
- No rate limiting / abuse protection on auth and apply endpoints.

## E) Engineering Quality Gaps

- No backend tests found under src/test.
- No frontend test files found.
- No CI pipeline visible for build/test/lint/deploy checks.
- No containerization/deployment files visible (Dockerfile, compose, IaC).

## 4. Features You Can Add (Recommended Backlog)

## 4.1 High Impact, Fast Wins (Do First)

1. Live dashboard metrics for employer and job seeker pages.
2. Application stage transitions (shortlist/reject/interview) with audit trail.
3. Real-time or polling notifications for status changes.
4. Basic test coverage (critical backend services + frontend flow tests).
5. Secure config via environment variables and profile-specific configs.

## 4.2 Strong Product Differentiators (Next)

1. AI confidence score and explanation badges.
2. ATS score and resume improvement hints before submit.
3. AI interview question generation per candidate and job.
4. Skill heatmap and hiring funnel analytics for employers/admin.
5. Candidate side-by-side compare page for employers.

## 4.3 Enterprise Readiness (After Core Stability)

1. Audit logs and admin compliance panel.
2. CSV/PDF exports for jobs/applications/screenings.
3. Data retention and cleanup scheduler.
4. SLA monitoring and alerting.
5. Role-based permission matrix expansion.

## 5. Current Completion Assessment

Estimated maturity by layer:

- Core MVP functional completion: High (about 75-85%)
- Production readiness: Medium-Low (about 40-55%)
- Enterprise readiness: Low (about 20-30%)

Interpretation:

- The platform already works well as a strong academic/final-year major project MVP.
- Main remaining work is around production-hardening, automation/testing, and advanced employer workflow features.

## 6. Clear "Features Left Now" Checklist

## Immediate (must-have to move from demo to robust product)

- [ ] Live metrics for all dashboards.
- [ ] Full candidate stage management flow (SHORTLISTED/REJECTED/INTERVIEW).
- [ ] Backend and frontend automated tests for critical flows.
- [ ] Secure secrets and environment-based configuration.
- [ ] Better upload security and validation controls.

## Near-Term (important competitive features)

- [ ] Interview scheduling module.
- [ ] Notifications module.
- [ ] ATS score + resume tips.
- [ ] AI confidence score.
- [ ] Skill/funnel analytics.

## Later (enterprise scale and trust)

- [ ] Audit logs.
- [ ] Export and reporting.
- [ ] Retention policies.
- [ ] SLA monitoring.
- [ ] Fairness/bias reporting.

## 7. Final Conclusion

You are creating this project to make hiring faster, smarter, and more transparent while helping candidates improve through actionable AI feedback.

What you already have is a strong end-to-end MVP with role-based workflows, AI screening, and admin governance.

What is left is mostly:

- workflow maturity (stage management, scheduling),
- product polish (live metrics, notifications),
- AI depth (confidence/ATS/interview generation),
- and production engineering quality (tests, security hardening, CI/CD, operations).

This is a very good foundation for a major project and can be upgraded into a production-grade platform with the next planned sprints.

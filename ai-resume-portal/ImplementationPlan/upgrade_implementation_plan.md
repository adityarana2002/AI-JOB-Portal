# Upgrade Implementation Plan (Professional Features)

## Purpose
This file converts the upgrade ideas into simple, line-by-line implementation tasks for your current project.

## Line Format
Each line follows this format:
Feature -> Backend -> Frontend -> API -> Test

## A) Smart Hiring Intelligence

1. Candidate Ranking Leaderboard -> Build ranking logic using screening score + skill match in ApplicationService -> Show ranked table in employer ViewApplicants page -> GET /api/employer/jobs/{jobId}/rankings -> Verify rank order and edge cases with equal scores.
2. AI Confidence Score -> Add confidence field in ScreeningResult entity and response DTO -> Display confidence badge (High/Medium/Low) in screening result cards -> Included in existing screening result API response -> Unit test confidence mapping thresholds.
3. Skill Heatmap -> Aggregate top matched and missing skills per job in analytics service -> Add heatmap chart in employer dashboard -> GET /api/employer/jobs/{jobId}/skills-heatmap -> Validate aggregation using sample screening records.
4. Hiring Funnel Analytics -> Add status counters (Applied, Screened, Shortlisted, Interviewed, Hired) in admin/employer service -> Render funnel chart in dashboard -> GET /api/employer/jobs/{jobId}/funnel -> Integration test status transitions and counts.

## B) Better Employer Workflow

5. Kanban Hiring Board -> Add application stage field and stage update service -> Create drag-and-drop kanban in employer ViewApplicants page -> PATCH /api/employer/applications/{id}/stage -> Test stage movement permissions by role.
6. Side-by-Side Resume Compare -> Add compare endpoint returning normalized candidate summary -> Create compare panel for two selected applicants -> GET /api/employer/jobs/{jobId}/compare?appA={id}&appB={id} -> Test summary consistency and null-safe fields.
7. Interview Scheduling -> Add interview schedule entity with date/time/link/notes -> Add scheduling modal and calendar list in employer area -> POST /api/employer/interviews and GET /api/employer/interviews -> Test date validation and conflict detection.
8. Email Template Automation -> Add template storage and send-email event service -> Add template editor and trigger buttons in employer UI -> POST /api/employer/notifications/send-template -> Test template variable replacement and delivery logs.

## C) Better Job Seeker Experience

9. Resume ATS Score -> Add ATS checklist engine (format, keywords, structure, length) in AI/resume module -> Show ATS score card before submit in ApplyJob page -> POST /api/jobseeker/resume/ats-score -> Test scoring rules against sample resumes.
10. Resume Improvement Tips -> Add bullet rewrite suggestion logic using AI prompt templates -> Show improvement suggestions panel in ScreeningResult page -> GET /api/jobseeker/applications/{id}/resume-tips -> Test deterministic formatting and fallback when AI fails.
11. Portfolio Booster -> Add GitHub/LinkedIn parser integration service and profile summary generator -> Add connect/import section in Job Seeker dashboard -> POST /api/jobseeker/profile/import -> Test invalid URLs and private profile handling.
12. 30/60/90 Day Career Path -> Extend learning plan model for milestone timeline -> Add progress timeline component in Job Seeker dashboard -> GET /api/jobseeker/applications/{id}/career-path -> Test path generation for different missing-skill counts.

## D) Advanced AI Features

13. AI Interview Question Generator -> Add job+resume based interview question generation service -> Show generated question list in employer and job seeker views -> GET /api/applications/{id}/interview-questions -> Test minimum/maximum question count and category balance.
14. Mock Interview Practice -> Add session entity for Q/A practice and feedback scoring -> Build mock interview page with timer and answer input -> POST /api/jobseeker/mock-interview/start and POST /submit-answer -> Test scoring output format and session expiry.
15. Duplicate/Fake Resume Detection -> Add checksum/text similarity pipeline and risk score -> Show risk warning tag in applicant list -> GET /api/employer/applications/{id}/risk -> Test duplicate detection threshold and false-positive controls.
16. Bias Check Report -> Add fairness audit service for prompt/output checks -> Add bias report panel in admin screening reports page -> GET /api/admin/ai/bias-report -> Test report generation for empty and non-empty datasets.

## E) Enterprise and Trust Features

17. Audit Logs -> Add audit_log table and interceptor for create/update/delete events -> Add admin audit log table with filters -> GET /api/admin/audit-logs -> Test captured actor, action, target, timestamp.
18. CSV/PDF Exports -> Add export service for jobs, applications, and reports -> Add Export buttons in admin and employer pages -> GET /api/admin/reports/export?type=csv|pdf -> Test large dataset export and file download headers.
19. Data Retention Controls -> Add retention policy config and scheduled cleanup job -> Add admin policy settings page -> PUT /api/admin/settings/retention-policy -> Test cleanup respects retention period.
20. SLA Monitoring and Alerts -> Add health metrics collection and alert trigger rules -> Add SLA status cards in admin dashboard -> GET /api/admin/system/sla-status -> Test alert trigger on simulated API latency/failure.

## F) Product Polish Features

21. Real-Time Notifications -> Add websocket or SSE notification service -> Add bell icon panel in all role layouts -> GET /api/notifications and SUBSCRIBE /ws/notifications -> Test delivery and unread counter sync.
22. Branded Career Page -> Add public career-page config model and content service -> Add company branding editor and public careers route -> GET /api/public/company/{id}/careers -> Test SEO meta tags and mobile layout.
23. Multi-Language Support -> Add i18n translation key support in frontend and localized labels in backend responses where needed -> Add language selector in app header -> Existing APIs unchanged (content keys handled frontend-side) -> Test language switch persistence after login.
24. Accessibility Mode -> Add accessibility settings profile and UI preference persistence -> Add high-contrast, larger-font, keyboard-friendly toggle in settings -> PUT /api/users/me/preferences/accessibility -> Test keyboard navigation and contrast compliance.

## Recommended Rollout Sequence

- Sprint 1: Lines 1, 5, 17, 21 (high visible impact)
- Sprint 2: Lines 2, 3, 9, 10, 18
- Sprint 3: Lines 4, 7, 11, 12, 23, 24
- Sprint 4: Lines 6, 8, 13, 14, 15, 16, 19, 20, 22

## Suggested Next Step
Start with Sprint 1 and create technical tasks from Lines 1, 5, 17, and 21.

Detailed file-by-file breakdown created for Line 1:
- upgrade_line1_candidate_ranking_tasks.md

# Features Added — Batch 01

**Date:** 2026-04-26  
**Status:** Ready for Review  
**Batch:** 01 of N  

---

## Overview

Two high-impact features were implemented in this batch, along with a full UI/UX overhaul of the dashboard pages and applicant view:

| # | Feature | Type |
|---|---------|------|
| 1 | **Live Dashboard Metrics** (Employer + Job Seeker) | Full-stack |
| 2 | **Employer Shortlist / Reject Workflow** | Full-stack |

Plus: SVG hero illustrations, metric loading states, confirm dialog, toast notifications, and decision badges.

---

## Feature 1 — Live Dashboard Metrics

### What Was Added

Both the Employer and Job Seeker dashboards now show **real-time numbers** pulled from the API instead of static hardcoded values.

**Employer Dashboard now shows:**
- Active Job Posts (jobs you posted that are still open)
- Total Applications received across all your jobs
- Shortlisted Candidates (how many you have shortlisted)
- Avg AI Match Score (average AI screening score across all your jobs)

**Job Seeker Dashboard now shows:**
- Total Applications submitted
- High Matches — applications where AI gave 70%+ score
- Shortlisted — how many employers shortlisted you
- Awaiting Response — applications still in PENDING state

### Backend Changes

| File | Change |
|------|--------|
| `backend/src/main/java/com/portal/application/repository/ApplicationRepository.java` | Added `countByApplicantId`, `countByApplicantIdAndStatus`, `countByJobEmployerId`, `countByJobEmployerIdAndStatus` JPA queries |
| `backend/src/main/java/com/portal/job/repository/JobRepository.java` | Added `countByEmployerIdAndIsActiveTrue` |
| `backend/src/main/java/com/portal/ai/repository/ScreeningResultRepository.java` | Added `avgMatchScoreByEmployerId`, `countHighMatchByApplicantId` |
| `backend/src/main/java/com/portal/application/dto/EmployerStatsResponse.java` | **NEW** — DTO with `activeJobs`, `totalApplications`, `shortlistedCount`, `avgMatchScore` |
| `backend/src/main/java/com/portal/application/dto/JobSeekerStatsResponse.java` | **NEW** — DTO with `totalApplications`, `highMatchCount`, `shortlistedCount`, `pendingCount` |
| `backend/src/main/java/com/portal/application/service/ApplicationService.java` | Added `getEmployerStats()` and `getJobSeekerStats()` methods |
| `backend/src/main/java/com/portal/application/controller/ApplicationController.java` | Added `GET /api/applications/employer-stats` and `GET /api/applications/stats` endpoints |

### Frontend Changes

| File | Change |
|------|--------|
| `frontend/src/types/application.ts` | Added `EmployerStats` and `JobSeekerStats` interfaces |
| `frontend/src/services/applicationService.ts` | Added `getEmployerStats()` and `getJobSeekerStats()` API calls |
| `frontend/src/pages/employer/Dashboard.tsx` | **Rewritten** — live stats fetch, 4 metric cards, SVG hero illustration, quick action buttons |
| `frontend/src/pages/jobseeker/Dashboard.tsx` | **Rewritten** — live stats fetch, 4 metric cards, SVG hero illustration, quick action buttons |

### New API Endpoints

```
GET /api/applications/employer-stats
  Auth: EMPLOYER role required
  Response: { activeJobs, totalApplications, shortlistedCount, avgMatchScore }

GET /api/applications/stats
  Auth: JOB_SEEKER role required
  Response: { totalApplications, highMatchCount, shortlistedCount, pendingCount }
```

---

## Feature 2 — Employer Shortlist / Reject Workflow

### What Was Added

Employers can now **take action on individual candidates** directly from the Ranked Applicants page. Each candidate card now has:
- **Shortlist button** (green) — marks the candidate as SHORTLISTED
- **Reject button** (red) — marks the candidate as REJECTED
- A **confirmation dialog** appears before the action is applied
- A **toast notification** confirms the result
- Once a decision is made, the buttons are replaced with a clear **decision badge** (Shortlisted / Rejected)

The status update is persisted in the database and reflected immediately in the UI without a full page reload.

### Backend Changes

| File | Change |
|------|--------|
| `backend/src/main/java/com/portal/application/dto/StatusUpdateRequest.java` | **NEW** — DTO with `status` field (validated with `@NotNull`) |
| `backend/src/main/java/com/portal/application/service/ApplicationService.java` | Added `updateApplicationStatus()` method — validates only SHORTLISTED/REJECTED are allowed, checks employer ownership |
| `backend/src/main/java/com/portal/application/controller/ApplicationController.java` | Added `PATCH /api/applications/{id}/status` endpoint |

### New API Endpoint

```
PATCH /api/applications/{id}/status
  Auth: EMPLOYER (must own the job) or SUPER_ADMIN
  Body: { "status": "SHORTLISTED" | "REJECTED" }
  Response: Updated ApplicationResponse
  Validation: Only SHORTLISTED and REJECTED are accepted; other statuses return 400
```

### Frontend Changes

| File | Change |
|------|--------|
| `frontend/src/types/application.ts` | (already had ApplicationStatus type) |
| `frontend/src/services/applicationService.ts` | Added `updateStatus(applicationId, status)` call |
| `frontend/src/pages/employer/ViewApplicants.tsx` | **Rewritten** — action buttons per card, ConfirmDialog component, Toast component, EmptyIllustration SVG, decision badge, optimistic UI update |

---

## UI / UX Improvements

### SVG Illustrations Added

1. **Employer Dashboard — Hiring Funnel SVG**  
   An animated funnel showing All Applicants → AI Screened → Shortlisted, with glowing dots representing candidates moving through the pipeline.

2. **Job Seeker Dashboard — Career Path SVG**  
   A career trajectory arc with labelled milestone nodes (Apply → Screen → Review → Hire), a floating resume card, AI sparkle icon, and a live "87% match" badge.

3. **ViewApplicants — Empty State Illustration**  
   A custom SVG person placeholder with a "+" add button — displayed when no applicants exist for a job.

### New CSS Classes

All new styles were added to `frontend/src/index.css`:

| Class | Purpose |
|-------|---------|
| `.welcome-banner__kicker` | Uppercase label above welcome greeting |
| `.welcome-banner__art` | Right-side SVG illustration container |
| `.employer-banner` | Blue gradient for employer welcome banner |
| `.seeker-banner` | Teal gradient for job seeker welcome banner |
| `.metric-loading-bar` | Shimmer bar shown while stats are loading |
| `.applicant-card__actions` | Button row on candidate cards |
| `.decision-badge` | Shortlisted / Rejected result badge |
| `.confirm-overlay` | Full-screen blur backdrop for confirm dialog |
| `.confirm-dialog` | Centered card dialog with icon, message, actions |
| `.action-toast` | Success / error toast notification bar |

---

## How to Test

### Prerequisites

Make sure these are running:
1. MySQL database accessible at credentials in `application.yml`
2. Backend: `cd ai-resume-portal/backend && mvn spring-boot:run`
3. Frontend: `cd ai-resume-portal/frontend && npm run dev`

---

### Testing Feature 1 — Live Dashboard Metrics

#### Employer Dashboard

1. Register as an **EMPLOYER** (or log in with existing employer account).
2. Log in → you are redirected to `/employer/dashboard`.
3. **Expected:** The 4 metric cards load with a shimmer animation, then display real counts from the database.
4. If you have no jobs/applications yet, all cards show `0`.
5. Post a job, have a job seeker apply, then refresh the dashboard → numbers update.

**API test (optional, using Postman or curl):**
```
GET http://localhost:8080/api/applications/employer-stats
Authorization: Bearer <employer_jwt_token>
```

#### Job Seeker Dashboard

1. Register as a **JOB_SEEKER** (or log in with existing account).
2. Log in → you are redirected to `/jobseeker/dashboard`.
3. **Expected:** 4 metric cards show live data.
4. Apply to a job, then return to the dashboard → "Total Applications" increments.
5. After AI screening completes (score ≥ 70), "High Matches" increments.

**API test:**
```
GET http://localhost:8080/api/applications/stats
Authorization: Bearer <jobseeker_jwt_token>
```

---

### Testing Feature 2 — Employer Shortlist / Reject

1. Log in as **EMPLOYER**.
2. Go to **My Jobs** → click **View Applicants** on any job that has applicants.
3. You will see candidate cards with an AI match score bar.
4. **On a candidate not yet decided:** you will see a green **Shortlist** and red **Reject** button at the bottom.
5. Click **Shortlist** → a confirmation dialog appears.
   - Confirm → the button disappears, replaced by a green "✓ Shortlisted" badge.
   - A success toast appears at the top of the page.
6. On a different candidate, click **Reject** → confirmation dialog → confirm → red "✗ Rejected" badge appears.
7. **Reload the page** → the badges are still shown (status is persisted in DB).

**API test:**
```
PATCH http://localhost:8080/api/applications/{applicationId}/status
Authorization: Bearer <employer_jwt_token>
Content-Type: application/json
Body: { "status": "SHORTLISTED" }
```

**Edge cases to verify:**
- Sending `{ "status": "PENDING" }` → returns HTTP 400 (only SHORTLISTED/REJECTED allowed)
- A job seeker token trying to call this → returns HTTP 403
- A different employer's token on a job they don't own → returns HTTP 403

---

## Files Changed Summary

### Backend (7 files modified / 3 new files)

```
backend/src/main/java/com/portal/application/
  ├── repository/ApplicationRepository.java    ← modified
  ├── dto/EmployerStatsResponse.java           ← NEW
  ├── dto/JobSeekerStatsResponse.java          ← NEW
  ├── dto/StatusUpdateRequest.java             ← NEW
  ├── service/ApplicationService.java          ← modified
  └── controller/ApplicationController.java    ← modified

backend/src/main/java/com/portal/job/
  └── repository/JobRepository.java            ← modified

backend/src/main/java/com/portal/ai/
  └── repository/ScreeningResultRepository.java ← modified
```

### Frontend (7 files modified)

```
frontend/src/
  ├── types/application.ts                     ← modified (added EmployerStats, JobSeekerStats)
  ├── services/applicationService.ts           ← modified (added 3 new functions)
  ├── pages/employer/Dashboard.tsx             ← rewritten
  ├── pages/employer/ViewApplicants.tsx        ← rewritten
  ├── pages/jobseeker/Dashboard.tsx            ← rewritten
  └── index.css                                ← modified (new classes appended)
```

---

## What's Next (Batch 02 — pending your approval)

Recommended next 2 features:

1. **Duplicate Application Prevention** — Prevent a job seeker from applying to the same job twice (backend guard + friendly frontend error message).
2. **Advanced Job Filtering & Sorting** — Filter BrowseJobs by job type, experience level, salary range; sort by newest / highest paying.

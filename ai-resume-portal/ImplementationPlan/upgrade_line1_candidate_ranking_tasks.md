# Line 1 Implementation Tasks - Candidate Ranking Leaderboard

## Goal
Implement a ranking endpoint and UI for employers to see applicants ordered by screening quality for one job.

Ranking formula for V1:
- Primary: screening matchScore (descending)
- Tie-breaker 1: application status priority (SHORTLISTED > SCREENED > SCREENING > PENDING > REJECTED)
- Tie-breaker 2: application createdAt (ascending, earlier applicant first)

## API Contract (V1)
Endpoint:
- GET /api/jobs/{id}/rankings

Response item:
- applicationId: number
- jobId: number
- applicantId: number | null
- applicantName: string | null
- applicantEmail: string | null
- status: string
- matchScore: number | null
- rankingReason: string
- createdAt: string | null

Rules:
- Employer can only access own job rankings.
- Super admin can access all.
- Job seeker cannot access.

## Backend File-by-File Tasks

1) File: backend/src/main/java/com/portal/application/dto/CandidateRankingResponse.java (new)
- Create DTO with fields from API contract.
- Add static mapper method from JobApplication + ScreeningResult.
- Add method to generate rankingReason string:
  - Example: "Score 84, status SCREENED"

2) File: backend/src/main/java/com/portal/ai/repository/ScreeningResultRepository.java
- Add bulk fetch method for one job:
  - List<ScreeningResult> findByApplicationJobId(Long jobId)
- Keep existing findByApplicationId unchanged.

3) File: backend/src/main/java/com/portal/application/service/ApplicationService.java
- Add method:
  - List<CandidateRankingResponse> getRankedApplicantsForJob(Long jobId, Authentication authentication)
- Reuse existing job ownership authorization logic (same pattern as getApplicantsForJob).
- Fetch applications by jobId and screening results by jobId.
- Build applicationId -> screeningResult map.
- Convert to CandidateRankingResponse list.
- Sort list by formula defined above.
- Return sorted list.

4) File: backend/src/main/java/com/portal/job/controller/JobController.java
- Add new endpoint:
  - @GetMapping("/{id}/rankings")
- Delegate to applicationService.getRankedApplicantsForJob(id, authentication).
- Return ResponseEntity<List<CandidateRankingResponse>>.

5) File: backend/src/main/java/com/portal/config/SecurityConfig.java
- Add/extend matcher to allow authenticated GET for /api/jobs/*/rankings.
- Keep authorization checks in service for role and ownership control.

## Frontend File-by-File Tasks

6) File: frontend/src/types/application.ts
- Add type for ranking response:
  - export interface CandidateRanking { ... }
- Keep existing Application interface unchanged to avoid side effects.

7) File: frontend/src/services/jobService.ts
- Add method:
  - const getRankings = async (jobId: number) => api.get<CandidateRanking[]>(`/jobs/${jobId}/rankings`)
- Export method in default object.

8) File: frontend/src/pages/employer/ViewApplicants.tsx
- Replace or augment current applicant fetch with ranking fetch.
- Show rank number in each card (1, 2, 3...).
- Show match score and rankingReason.
- Keep fallback when score is null:
  - display "Score: Pending"
- Keep existing error and loading states.

## Testing Tasks (Create These Files)

9) File: backend/src/test/java/com/portal/application/service/ApplicationServiceRankingTest.java (new)
- Test sorting by higher score first.
- Test tie-breaker by status priority.
- Test tie-breaker by createdAt.
- Test unauthorized employer cannot view other employer job.

10) File: backend/src/test/java/com/portal/job/controller/JobControllerRankingTest.java (new)
- Test GET /api/jobs/{id}/rankings returns 200 for valid employer.
- Test returns 403 for job seeker.
- Test returns 404 for unknown job.

11) File: frontend/src/pages/employer/__tests__/ViewApplicants.ranking.test.tsx (new)
- Mock getRankings response.
- Verify rank order rendered.
- Verify pending score text for null score.
- Verify error UI on API failure.

## Execution Order
1. Create DTO and repository method.
2. Implement service ranking logic and sorting.
3. Add controller endpoint and security matcher.
4. Add frontend type and service method.
5. Update ViewApplicants UI.
6. Add backend and frontend tests.

## Definition of Done
- Employer sees ranked applicants for a job in UI.
- API returns sorted list with clear ranking reason.
- Access control works correctly for employer/super admin/job seeker.
- Automated tests cover sorting and authorization paths.

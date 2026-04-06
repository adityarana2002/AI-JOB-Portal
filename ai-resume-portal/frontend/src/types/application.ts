export type ApplicationStatus = 'PENDING' | 'SCREENING' | 'SCREENED' | 'SHORTLISTED' | 'REJECTED'

export interface Application {
  id: number
  jobId: number
  jobTitle?: string | null
  applicantId?: number | null
  applicantName?: string | null
  applicantEmail?: string | null
  status: ApplicationStatus
  resumePath?: string | null
  coverLetter?: string | null
  createdAt?: string | null
}

export interface CandidateRanking {
  applicationId: number
  jobId?: number | null
  applicantId?: number | null
  applicantName?: string | null
  applicantEmail?: string | null
  status: ApplicationStatus
  matchScore?: number | null
  rankingReason?: string | null
  createdAt?: string | null
}

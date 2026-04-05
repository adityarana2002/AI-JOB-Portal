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

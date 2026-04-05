import type { UserRole } from './user'

export interface AdminDashboard {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalScreenings: number
}

export interface AdminUser {
  id: number
  fullName: string
  email: string
  role: UserRole
  phone?: string | null
  companyName?: string | null
  isActive: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ScreeningReport {
  id: number
  applicationId?: number | null
  jobId?: number | null
  jobTitle?: string | null
  applicantId?: number | null
  applicantName?: string | null
  matchScore?: number | null
  isEligible?: boolean | null
  matchedSkills?: string[]
  missingSkills?: string[]
  strengths?: string[]
  weaknesses?: string[]
  summary?: string | null
  createdAt?: string | null
}

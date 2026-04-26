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

export type AuditAction =
  | 'USER_CREATED'
  | 'JOB_POSTED'
  | 'JOB_CLOSED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'APPLICATION_WITHDRAWN'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_CANCELLED'
  | 'USER_STATUS_CHANGED'

export interface AuditLogEntry {
  id: number
  actorId?: number | null
  actorEmail?: string | null
  action: AuditAction
  targetType?: string | null
  targetId?: number | null
  detail?: string | null
  createdAt?: string | null
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

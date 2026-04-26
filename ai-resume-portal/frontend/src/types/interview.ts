export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'

export type InterviewType = 'VIDEO_CALL' | 'PHONE_CALL' | 'IN_PERSON'

export interface Interview {
  id: number
  applicationId: number
  jobId: number
  jobTitle: string
  companyName: string
  employerId: number
  employerName: string
  employerEmail: string
  applicantId: number
  applicantName: string
  applicantEmail: string
  scheduledAt: string
  meetingLink?: string | null
  interviewType: InterviewType
  durationMinutes: number
  message?: string | null
  status: InterviewStatus
  candidateNote?: string | null
  createdAt: string
  updatedAt: string
}

export interface ScheduleInterviewRequest {
  applicationId: number
  scheduledAt: string
  meetingLink?: string
  interviewType: InterviewType
  durationMinutes?: number
  message?: string
}

export interface RescheduleInterviewRequest {
  scheduledAt?: string
  meetingLink?: string
  interviewType?: InterviewType
  durationMinutes?: number
  message?: string
}

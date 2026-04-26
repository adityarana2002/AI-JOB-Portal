export type NotificationType =
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_CONFIRMED'
  | 'INTERVIEW_DECLINED'
  | 'INTERVIEW_CANCELLED'
  | 'INTERVIEW_RESCHEDULED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'NEW_APPLICATION'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  referenceId?: number | null
  referenceType?: string | null
  isRead: boolean
  createdAt: string
}

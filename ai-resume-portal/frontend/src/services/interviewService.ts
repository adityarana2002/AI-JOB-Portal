import api from './api'
import type {
  Interview,
  ScheduleInterviewRequest,
  RescheduleInterviewRequest,
} from '../types/interview'

export const scheduleInterview = (data: ScheduleInterviewRequest): Promise<Interview> =>
  api.post('/interviews', data).then((r) => r.data)

export const getMyInterviews = (): Promise<Interview[]> =>
  api.get('/interviews').then((r) => r.data)

export const getInterview = (id: number): Promise<Interview> =>
  api.get(`/interviews/${id}`).then((r) => r.data)

export const getInterviewsForApplication = (applicationId: number): Promise<Interview[]> =>
  api.get(`/interviews/application/${applicationId}`).then((r) => r.data)

export const rescheduleInterview = (id: number, data: RescheduleInterviewRequest): Promise<Interview> =>
  api.put(`/interviews/${id}/reschedule`, data).then((r) => r.data)

export const respondToInterview = (
  id: number,
  confirm: boolean,
  candidateNote?: string,
): Promise<Interview> =>
  api.patch(`/interviews/${id}/respond`, { confirm, candidateNote }).then((r) => r.data)

export const markInterviewCompleted = (id: number): Promise<Interview> =>
  api.patch(`/interviews/${id}/complete`).then((r) => r.data)

export const cancelInterview = (id: number): Promise<Interview> =>
  api.delete(`/interviews/${id}`).then((r) => r.data)

const interviewService = {
  scheduleInterview,
  getMyInterviews,
  getInterview,
  getInterviewsForApplication,
  rescheduleInterview,
  respondToInterview,
  markInterviewCompleted,
  cancelInterview,
}

export default interviewService

import api from './api'
import type { Application, ApplicationStatus, EmployerStats, JobSeekerStats } from '../types/application'
import type { ScreeningResultResponse } from '../types/screening'

const applyToJob = async (jobId: number, resumeFile: File, coverLetter?: string) => {
  const form = new FormData()
  form.append('resume', resumeFile)
  if (coverLetter) {
    form.append('coverLetter', coverLetter)
  }
  const { data } = await api.post<Application>(`/applications/${jobId}/apply`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

const listMyApplications = async () => {
  const { data } = await api.get<Application[]>('/applications/my-applications')
  return data
}

const getApplication = async (id: number) => {
  const { data } = await api.get<Application>(`/applications/${id}`)
  return data
}

const getScreening = async (id: number) => {
  const { data } = await api.get<ScreeningResultResponse>(`/applications/${id}/screening`)
  return data
}

const getJobSeekerStats = async () => {
  const { data } = await api.get<JobSeekerStats>('/applications/stats')
  return data
}

const getEmployerStats = async () => {
  const { data } = await api.get<EmployerStats>('/applications/employer-stats')
  return data
}

const updateStatus = async (applicationId: number, status: ApplicationStatus) => {
  const { data } = await api.patch<Application>(`/applications/${applicationId}/status`, { status })
  return data
}

const checkApplied = async (jobId: number): Promise<boolean> => {
  const { data } = await api.get<{ applied: boolean }>(`/applications/check/${jobId}`)
  return data.applied
}

const viewResume = async (applicationId: number): Promise<void> => {
  const response = await api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const withdrawApplication = async (applicationId: number) => {
  const { data } = await api.patch<Application>(`/applications/${applicationId}/withdraw`)
  return data
}

export default { applyToJob, listMyApplications, getApplication, getScreening, getJobSeekerStats, getEmployerStats, updateStatus, checkApplied, viewResume, withdrawApplication }

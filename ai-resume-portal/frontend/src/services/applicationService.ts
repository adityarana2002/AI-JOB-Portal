import api from './api'
import type { Application } from '../types/application'
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

export default { applyToJob, listMyApplications, getApplication, getScreening }

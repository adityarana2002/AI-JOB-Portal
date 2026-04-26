import api from './api'
import type { Job, JobRequest } from '../types/job'
import type { Application, CandidateRanking } from '../types/application'

const listJobs = async () => {
  const { data } = await api.get<Job[]>('/jobs')
  return data
}

const getJob = async (id: number) => {
  const { data } = await api.get<Job>(`/jobs/${id}`)
  return data
}

const createJob = async (payload: JobRequest) => {
  const { data } = await api.post<Job>('/jobs', payload)
  return data
}

const updateJob = async (id: number, payload: JobRequest) => {
  const { data } = await api.put<Job>(`/jobs/${id}`, payload)
  return data
}

const deleteJob = async (id: number) => {
  await api.delete(`/jobs/${id}`)
}

const getMyJobs = async () => {
  const { data } = await api.get<Job[]>('/jobs/my-jobs')
  return data
}

const getApplicants = async (jobId: number) => {
  const { data } = await api.get<Application[]>(`/jobs/${jobId}/applicants`)
  return data
}

const getRankings = async (jobId: number) => {
  const { data } = await api.get<CandidateRanking[]>(`/jobs/${jobId}/rankings`)
  return data
}

const toggleBookmark = async (jobId: number): Promise<{ saved: boolean }> => {
  const { data } = await api.post<{ saved: boolean }>(`/jobs/${jobId}/bookmark`)
  return data
}

const getSavedJobs = async (): Promise<Job[]> => {
  const { data } = await api.get<Job[]>('/jobs/saved')
  return data
}

const checkBookmark = async (jobId: number): Promise<boolean> => {
  const { data } = await api.get<{ saved: boolean }>(`/jobs/${jobId}/bookmark`)
  return data.saved
}

export default { listJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, getApplicants, getRankings, toggleBookmark, getSavedJobs, checkBookmark }

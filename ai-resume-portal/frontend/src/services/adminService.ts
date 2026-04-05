import api from './api'
import type { AdminDashboard, AdminUser, ScreeningReport } from '../types/admin'
import type { Job } from '../types/job'
import type { Application } from '../types/application'

const getDashboard = async () => {
  const { data } = await api.get<AdminDashboard>('/admin/dashboard')
  return data
}

const listUsers = async () => {
  const { data } = await api.get<AdminUser[]>('/admin/users')
  return data
}

const updateUserStatus = async (id: number, isActive: boolean) => {
  const { data } = await api.put<AdminUser>(`/admin/users/${id}/status`, { isActive })
  return data
}

const listJobs = async () => {
  const { data } = await api.get<Job[]>('/admin/jobs')
  return data
}

const listApplications = async () => {
  const { data } = await api.get<Application[]>('/admin/applications')
  return data
}

const listScreenings = async () => {
  const { data } = await api.get<ScreeningReport[]>('/admin/screenings')
  return data
}

export default { getDashboard, listUsers, updateUserStatus, listJobs, listApplications, listScreenings }

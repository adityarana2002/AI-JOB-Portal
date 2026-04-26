import api from './api'
import type { AdminDashboard, AdminUser, AuditAction, AuditLogEntry, PaginatedResponse, ScreeningReport } from '../types/admin'
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

const getAuditLogs = async (page = 0, size = 20, action?: AuditAction, search?: string) => {
  const params: Record<string, string | number> = { page, size }
  if (action) params.action = action
  if (search) params.search = search
  const { data } = await api.get<PaginatedResponse<AuditLogEntry>>('/admin/audit-logs', { params })
  return data
}

const exportUsersUrl = (format: 'csv' | 'pdf' = 'csv') => `/api/admin/export/users?format=${format}`
const exportApplicationsUrl = () => '/api/admin/export/applications'

export default { getDashboard, listUsers, updateUserStatus, listJobs, listApplications, listScreenings, getAuditLogs, exportUsersUrl, exportApplicationsUrl }

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'

export interface Job {
  id: number
  title: string
  description: string
  requiredSkills: string
  experienceRequired?: string | null
  salaryRange?: string | null
  location: string
  jobType: JobType
  isActive: boolean
  deadline?: string | null
  employerId?: number | null
  employerName?: string | null
  employerCompany?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface JobRequest {
  title: string
  description: string
  requiredSkills: string
  experienceRequired?: string
  salaryRange?: string
  location: string
  jobType: JobType
  deadline?: string
}

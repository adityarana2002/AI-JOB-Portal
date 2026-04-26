export type UserRole = 'SUPER_ADMIN' | 'EMPLOYER' | 'JOB_SEEKER'

export interface UserProfile {
  id: number
  fullName: string
  email: string
  role: UserRole
  phone?: string | null
  companyName?: string | null
  isActive?: boolean
  createdAt?: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  companyName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  role: UserRole
  phone?: string
  companyName?: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  userId: number
  fullName: string
  email: string
  role: UserRole
}

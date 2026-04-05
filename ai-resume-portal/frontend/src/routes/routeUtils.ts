import type { UserRole } from '../types/user'

export const getHomePath = (role?: UserRole | null) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin/dashboard'
    case 'EMPLOYER':
      return '/employer/dashboard'
    case 'JOB_SEEKER':
      return '/jobseeker/dashboard'
    default:
      return '/auth/login'
  }
}

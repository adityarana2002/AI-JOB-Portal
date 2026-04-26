import api from './api'
import type { UserProfile, UpdateProfileRequest } from '../types/user'

export const getProfile = (): Promise<UserProfile> =>
  api.get('/users/profile').then((r) => r.data)

export const updateProfile = (data: UpdateProfileRequest): Promise<UserProfile> =>
  api.put('/users/profile', data).then((r) => r.data)

const userService = { getProfile, updateProfile }
export default userService

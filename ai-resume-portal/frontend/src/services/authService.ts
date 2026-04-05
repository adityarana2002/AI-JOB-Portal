import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, UserProfile } from '../types/user'

const login = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

const me = async () => {
  const { data } = await api.get<UserProfile>('/auth/me')
  return data
}

export default { login, register, me }

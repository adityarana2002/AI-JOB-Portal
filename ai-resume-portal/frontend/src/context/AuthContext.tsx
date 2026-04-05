import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, LoginPayload, RegisterPayload, UserProfile } from '../types/user'
import authService from '../services/authService'
import { getHomePath } from '../routes/routeUtils'
import { useNavigate } from 'react-router-dom'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'auth_token'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const saveSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    setToken(response.token)
    setUser({
      id: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
      isActive: true,
    })
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    saveSession(response)
    navigate(getHomePath(response.role), { replace: true })
  }, [navigate, saveSession])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    saveSession(response)
    navigate(getHomePath(response.role), { replace: true })
  }, [navigate, saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setToken(null)
    navigate('/auth/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await authService.me()
        setUser(profile)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

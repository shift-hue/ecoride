'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { authApi, userApi, UserProfile } from '@/lib/api'

interface AuthState {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    department?: string
    year?: number
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ecoride_token')
    if (saved) {
      setToken(saved)
      userApi.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('ecoride_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    localStorage.setItem('ecoride_token', res.token)
    setToken(res.token)
    const profile = await userApi.me()
    setUser(profile)
  }

  async function register(data: {
    name: string
    email: string
    password: string
    department?: string
    year?: number
  }) {
    const res = await authApi.register(data)
    localStorage.setItem('ecoride_token', res.token)
    setToken(res.token)
    const profile = await userApi.me()
    setUser(profile)
  }

  function logout() {
    localStorage.removeItem('ecoride_token')
    setToken(null)
    setUser(null)
  }

  async function refreshUser() {
    const profile = await userApi.me()
    setUser(profile)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

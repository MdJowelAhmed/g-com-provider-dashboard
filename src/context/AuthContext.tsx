import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role } from '../types/role'

export type User = {
  id: string
  email: string
  role: Role
  businessName: string
  ownerName: string
  phone: string
  address: string
  stripeConnected: boolean
  extra: Record<string, string>
}

type RegisterInput = Omit<User, 'id' | 'stripeConnected'>

type AuthState = {
  user: User | null
  login: (email: string) => User | null
  register: (input: RegisterInput) => User
  connectStripe: () => void
  logout: () => void
}

const STORAGE_USERS = 'gcom.users'
const STORAGE_CURRENT = 'gcom.currentUser'

const AuthContext = createContext<AuthState | null>(null)

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_CURRENT, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_CURRENT)
  }, [user])

  const login = useCallback((email: string) => {
    const found = readUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (found) setUser(found)
    return found ?? null
  }, [])

  const register = useCallback((input: RegisterInput) => {
    const users = readUsers()
    const existing = users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase(),
    )
    if (existing) {
      setUser(existing)
      return existing
    }
    const newUser: User = {
      ...input,
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      stripeConnected: false,
    }
    users.push(newUser)
    writeUsers(users)
    setUser(newUser)
    return newUser
  }, [])

  const connectStripe = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev
      const updated: User = { ...prev, stripeConnected: true }
      const users = readUsers().map((u) => (u.id === updated.id ? updated : u))
      writeUsers(users)
      return updated
    })
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const value = useMemo<AuthState>(
    () => ({ user, login, register, connectStripe, logout }),
    [user, login, register, connectStripe, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

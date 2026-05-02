import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_STORAGE_KEYS } from '../auth/session'
import { normalizeUserRole } from '../routing/roleRedirect'
import type { Role } from '../types/role'
import type { User } from '../types/user'

export type { User } from '../types/user'

type RegisterInput = Omit<User, 'id' | 'stripeConnected'>

type AuthState = {
  user: User | null
  login: (email: string) => User | null
  /** Sign in and set active tenant role from the login form (persisted to session + user record). */
  loginWithRole: (email: string, role: Role) => User | null
  register: (input: RegisterInput) => User
  updateUser: (partial: Partial<User>) => void
  connectStripe: () => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function normalizeUserRecord(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null
  const u = raw as Partial<User>
  if (!u.email || typeof u.email !== 'string') return null
  const role = normalizeUserRole(u.role) as Role
  return { ...(u as User), role }
}

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.users)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeUserRecord).filter((u): u is User => u !== null)
  } catch {
    return []
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(AUTH_STORAGE_KEYS.users, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.currentUser)
      if (!raw) return null
      return normalizeUserRecord(JSON.parse(raw))
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_STORAGE_KEYS.currentUser, JSON.stringify(user))
    else localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser)
  }, [user])

  const login = useCallback((email: string) => {
    const found = readUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (found) setUser(found)
    return found ?? null
  }, [])

  const loginWithRole = useCallback((email: string, role: Role) => {
    const found = readUsers().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!found) return null
    const nextRole = normalizeUserRole(role) as Role
    const updated: User = { ...found, role: nextRole }
    const users = readUsers().map((u) => (u.id === updated.id ? updated : u))
    writeUsers(users)
    setUser(updated)
    return updated
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
      role: normalizeUserRole(input.role) as Role,
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

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated: User = {
        ...prev,
        ...partial,
        role: partial.role != null ? (normalizeUserRole(partial.role) as Role) : prev.role,
        extra: partial.extra ? { ...prev.extra, ...partial.extra } : prev.extra,
      }
      const users = readUsers().map((u) => (u.id === updated.id ? updated : u))
      writeUsers(users)
      return updated
    })
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
    () => ({
      user,
      login,
      loginWithRole,
      register,
      updateUser,
      connectStripe,
      logout,
    }),
    [user, login, loginWithRole, register, updateUser, connectStripe, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

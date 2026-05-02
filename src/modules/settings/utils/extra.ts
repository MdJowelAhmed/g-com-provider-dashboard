import type { User } from '../../../context/AuthContext'

export function readExtra(user: User, key: string, fallback = ''): string {
  return user.extra[key] ?? fallback
}

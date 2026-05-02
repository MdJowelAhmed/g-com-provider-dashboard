import type { Role } from '../types/role'
import { ROLES } from '../types/role'
import { dashboardPathForRole } from './routeConfig'

/** Legacy URLs / storage used `service`; canonical role is `services`. */
export function migrateRoleKey(raw: unknown): Role | null {
  if (raw === 'service') return 'services'
  if (typeof raw === 'string' && ROLES.includes(raw as Role)) return raw as Role
  return null
}

export function getDashboardPath(role: Role): string {
  return dashboardPathForRole(role)
}

/** `:role` segment from `/dashboard/:role/...` — invalid segments → `null` */
export function parseDashboardRoleParam(segment: string | undefined): Role | null {
  if (!segment) return null
  return migrateRoleKey(segment)
}

export function isRoleMismatch(urlRole: Role | null, userRole: Role): boolean {
  return urlRole !== null && urlRole !== userRole
}

/** Coerce persisted `role` JSON to a valid `Role` for routing / context */
export function normalizeUserRole(raw: unknown): Role {
  return migrateRoleKey(raw) ?? 'services'
}

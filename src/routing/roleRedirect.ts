import type { Role } from '../types/role'
import { ROLES } from '../types/role'
import { dashboardPathForRole } from './routeConfig'

/** Legacy URLs / storage used `service`; canonical role is `services`. */
export function migrateRoleKey(raw: unknown): Role | null {
  if (raw === 'service') return 'services'
  if (typeof raw === 'string' && ROLES.includes(raw as Role)) return raw as Role
  return null
}

/** API roles (e.g. `provider`) and dashboard tenant roles share the same URL segment. */
export function parseDashboardRoleParam(segment: string | undefined): string | null {
  if (!segment) return null
  const migrated = migrateRoleKey(segment)
  if (migrated) return migrated
  if (/^[a-z][a-z0-9_-]*$/i.test(segment)) return segment
  return null
}

export function getDashboardPath(role: string): string {
  return dashboardPathForRole(role)
}

/** Map API business category to dashboard tenant role. */
export function mapBusinessCategoryToRole(category: string): Role {
  const key = category.trim().toLowerCase()
  const map: Record<string, Role> = {
    shop: 'shops',
    shops: 'shops',
    service: 'services',
    services: 'services',
    stay: 'stay',
    hotel: 'stay',
    dine: 'dine',
    restaurant: 'dine',
    event: 'events',
    events: 'events',
  }
  return map[key] ?? migrateRoleKey(key) ?? 'services'
}

/** Map API role / business category to sidebar/config meta. */
export function resolveRoleForMeta(role: string): Role {
  if (role === 'provider') return 'services'
  const migrated = migrateRoleKey(role)
  if (migrated) return migrated
  return mapBusinessCategoryToRole(role)
}

export function isRoleMismatch(urlRole: string | null, userRole: string): boolean {
  return urlRole !== null && urlRole !== userRole
}

/** Coerce persisted `role` JSON to a valid `Role` for routing / context */
export function normalizeUserRole(raw: unknown): Role {
  return migrateRoleKey(raw) ?? 'services'
}

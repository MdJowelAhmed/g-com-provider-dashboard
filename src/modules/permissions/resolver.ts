import type { User } from '../../types/user'
import { resolveRoleForMeta } from '../../routing/roleRedirect'
import { ALL_NAV_PERMISSION_IDS, tabSegmentToNavPermissionId } from './navPermissionMap'
import { navPathToPermissionId } from './registry'

const STAFF_KEYS_EXTRA = 'staff_permission_keys'

/** Wildcard — grants every registered nav permission for this product surface */
export const PERMISSION_WILDCARD = '*'

function parseStaffKeys(user: User): string[] | null {
  const raw = user.extra?.[STAFF_KEYS_EXTRA]
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return null
  }
}

/**
 * Effective permission set for the signed-in user.
 * Owners without `staff_permission_keys` get full access (all nav ids + wildcard semantics).
 * Staff accounts store a JSON array on `user.extra.staff_permission_keys`.
 */
export function getEffectivePermissionIds(user: User): Set<string> {
  const keys = parseStaffKeys(user)
  if (keys === null) {
    return new Set([PERMISSION_WILDCARD, ...ALL_NAV_PERMISSION_IDS])
  }
  return new Set(keys)
}

export function hasPermission(user: User, permissionId: string): boolean {
  const ids = getEffectivePermissionIds(user)
  if (ids.has(PERMISSION_WILDCARD)) return true
  return ids.has(permissionId)
}

/** Sidebar / deep links: `navPath` is the URL segment (e.g. `legal`, `settings`). Empty = overview. */
export function hasNavAccess(user: User, navPath: string): boolean {
  const id = navPathToPermissionId(navPath)
  return hasPermission(user, id)
}

export function canAccessDashboardTab(user: User | null, tab: string | undefined): boolean {
  if (!user) return false
  const segment = tab ?? ''
  const id = tabSegmentToNavPermissionId(resolveRoleForMeta(user.role), segment)
  return hasPermission(user, id)
}

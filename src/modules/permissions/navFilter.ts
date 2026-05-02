import type { NavItem } from '../../config/roleConfig'
import type { User } from '../../types/user'
import { navItemToPermissionId } from './navPermissionMap'
import { getEffectivePermissionIds, PERMISSION_WILDCARD } from './resolver'

/** Returns nav items visible for this user (RBAC). Preserves order. */
export function filterNavItemsForUser(items: NavItem[], user: User): NavItem[] {
  const ids = getEffectivePermissionIds(user)
  const full = ids.has(PERMISSION_WILDCARD)
  return items.filter((item) => {
    if (full) return true
    const required = navItemToPermissionId(item)
    return ids.has(required)
  })
}

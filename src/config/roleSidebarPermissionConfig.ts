/**
 * Derived view of each dashboard role’s sidebar → permission keys.
 * Canonical menu definitions live in `roleConfig.tsx` (`ROLE_META[*].navItems`).
 */
import type { Role } from '../types/role'
import { ROLES } from '../types/role'
import { ROLE_META } from './roleConfig'
import { navItemToPermissionId } from '../modules/permissions/navPermissionMap'

export type SidebarPermissionRow = {
  path: string
  label: string
  permissionId: string
}

export const roleSidebarPermissionConfig: Record<Role, SidebarPermissionRow[]> = Object.fromEntries(
  ROLES.map((role) => [
    role,
    ROLE_META[role].navItems.map((item) => ({
      path: item.path,
      label: item.label,
      permissionId: navItemToPermissionId(item),
    })),
  ]),
) as Record<Role, SidebarPermissionRow[]>

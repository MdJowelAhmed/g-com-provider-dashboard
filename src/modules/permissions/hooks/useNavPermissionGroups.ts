import { useMemo } from 'react'
import type { Role } from '../../../types/role'
import { getNavPermissionGroupsForRole } from '../navPermissionMap'

/** Role-scoped sidebar permission groups for controller UI */
export function useNavPermissionGroups(role: Role) {
  return useMemo(() => getNavPermissionGroupsForRole(role), [role])
}

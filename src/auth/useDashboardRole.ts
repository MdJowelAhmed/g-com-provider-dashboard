import { useAuth } from '../context/AuthContext'
import { resolveRoleForMeta } from '../routing/roleRedirect'
import type { Role } from '../types/role'

/** Tenant/config role for sidebar, mocks, and feature modules. */
export function useDashboardRole(): Role {
  const { user } = useAuth()
  return resolveRoleForMeta(user?.role ?? 'services')
}

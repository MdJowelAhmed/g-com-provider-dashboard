import type { Role } from '../types/role'
import { ROLES } from '../types/role'

export const DASHBOARD_ROUTE_PREFIX = '/dashboard'

/** All dashboard tenant roles — single source for guards and menus */
export const DASHBOARD_ROLES: readonly Role[] = ROLES

export function dashboardPathForRole(role: string): string {
  return `${DASHBOARD_ROUTE_PREFIX}/${role}`
}

import { ROLE_META } from '../../config/roleConfig'
import type { NavItem } from '../../config/roleConfig'
import type { Role } from '../../types/role'
import { ROLES } from '../../types/role'
import type { PermissionDef, PermissionGroup } from './registry'
import { navPathToPermissionId } from './registry'

/** Permission key for a sidebar row — single source with URLs + RBAC. */
export function navItemToPermissionId(item: NavItem): string {
  return item.permissionId ?? navPathToPermissionId(item.path)
}

/** Map `/dashboard/:role/:tab` segment → permission id for that tenant role. */
export function tabSegmentToNavPermissionId(role: Role, segment: string): string {
  const item = ROLE_META[role].navItems.find((i) => i.path === segment)
  if (item) return navItemToPermissionId(item)
  return navPathToPermissionId(segment)
}

const NAV_DESCRIPTIONS: Record<string, string> = {
  'nav.overview': 'KPI and workspace overview.',
  'nav.services': 'Service catalog and bookings pipeline.',
  'nav.bookings': 'Bookings for your service business.',
  'nav.customers': 'Customer records and history.',
  'nav.rooms': 'Room inventory and availability.',
  'nav.reservations': 'Guest reservations and stays.',
  'nav.guests': 'Guest directory and profiles.',
  'nav.menu': 'Menu items and pricing.',
  'nav.orders': 'Incoming orders and fulfilment.',
  'nav.products': 'Product catalog and inventory.',
  'nav.shop-management': 'Business branch locations and opening hours.',
  'nav.business-categories': 'Business categories for products and catalog items.',
  'nav.events': 'Events you host or sell.',
  'nav.tickets': 'Ticket types and sales.',
  'nav.attendees': 'Check-in and attendee lists.',
  'nav.messages': 'Customer and internal conversations.',
  'nav.posts': 'Marketing and promotional content.',
  'nav.support': 'Support tickets and help center.',
  'nav.legal': 'Terms, privacy, and documentation.',
  'nav.settings': 'Profile and business preferences.',
  'nav.controllers': 'Staff accounts and access control.',
  'nav.withdraw': 'Payouts and banking.',
}

function descriptionForPermissionId(id: string, label: string): string {
  return NAV_DESCRIPTIONS[id] ?? `Access the ${label} area in this dashboard.`
}

export function getNavPermissionDefsForRole(role: Role): PermissionDef[] {
  return ROLE_META[role].navItems.map((item) => {
    const id = navItemToPermissionId(item)
    return {
      id,
      label: item.label,
      description: descriptionForPermissionId(id, item.label),
    }
  })
}

export function getAllowedNavPermissionIdsForRole(role: Role): string[] {
  return getNavPermissionDefsForRole(role).map((p) => p.id)
}

export function getNavPermissionGroupsForRole(role: Role): PermissionGroup[] {
  const meta = ROLE_META[role]
  return [
    {
      id: 'sidebar',
      label: 'Sidebar pages',
      description: `Matches the ${meta.label} menu. Controllers only see and open checked routes.`,
      permissions: getNavPermissionDefsForRole(role),
    },
  ]
}

function collectAllNavPermissionEntries(): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  for (const role of ROLES) {
    for (const item of ROLE_META[role].navItems) {
      const id = navItemToPermissionId(item)
      out.push({ id, label: item.label })
    }
  }
  return out
}

/** Union of every nav permission id across dashboard roles (deduped). */
export const ALL_NAV_PERMISSION_IDS: string[] = [
  ...new Set(collectAllNavPermissionEntries().map((e) => e.id)),
]

export const NAV_PERMISSION_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  collectAllNavPermissionEntries().map(({ id, label }) => [id, label]),
)

export function clampPermissionKeysForRole(keys: string[], role: Role): string[] {
  const allowed = new Set(getAllowedNavPermissionIdsForRole(role))
  return [...new Set(keys.filter((k) => allowed.has(k)))]
}

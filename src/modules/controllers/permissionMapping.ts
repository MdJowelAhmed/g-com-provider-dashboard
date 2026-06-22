import type { ControllerApiDoc } from '../../redux/api/controllerApi'
import type { ControllerFormValues, ControllerStatus, StaffController } from './types'

/** Backend staff permission enum — keep in sync with API validation. */
export const CONTROLLER_API_PERMISSIONS = [
  'dashboard_overview',
  'messages',
  'controllers',
  'orders',
  'shop_management',
  'settings',
  'withdraw',
  'post_management',
  'item_management',
  'category_management',
] as const

export type ControllerApiPermission = (typeof CONTROLLER_API_PERMISSIONS)[number]

const API_PERMISSION_SET = new Set<string>(CONTROLLER_API_PERMISSIONS)

/**
 * Maps sidebar `nav.*` permission ids → API enum values.
 * Nav items without a mapping are not sent to the staff API.
 */
const NAV_TO_API: Partial<Record<string, ControllerApiPermission>> = {
  'nav.overview': 'dashboard_overview',
  'nav.messages': 'messages',
  'nav.controllers': 'controllers',
  'nav.settings': 'settings',
  'nav.withdraw': 'withdraw',
  'nav.shop-management': 'shop_management',
  'nav.business-categories': 'category_management',
  'nav.posts': 'post_management',
  'nav.products': 'item_management',
  'nav.services': 'item_management',
  'nav.menu': 'item_management',
  'nav.rooms': 'item_management',
  'nav.events': 'item_management',
  'nav.orders': 'orders',
  'nav.bookings': 'orders',
  'nav.reservations': 'orders',
}

/** Preferred nav id when hydrating a single API permission for display/edit. */
const API_TO_NAV_PREFERRED: Record<ControllerApiPermission, string> = {
  dashboard_overview: 'nav.overview',
  messages: 'nav.messages',
  controllers: 'nav.controllers',
  settings: 'nav.settings',
  withdraw: 'nav.withdraw',
  shop_management: 'nav.shop-management',
  category_management: 'nav.business-categories',
  post_management: 'nav.posts',
  item_management: 'nav.products',
  orders: 'nav.orders',
}

export function isNavPermissionMappable(navKey: string) {
  return navKey in NAV_TO_API
}

export function isControllerApiPermission(value: string): value is ControllerApiPermission {
  return API_PERMISSION_SET.has(value)
}

export function navPermissionToApi(navKey: string): ControllerApiPermission | null {
  return NAV_TO_API[navKey] ?? null
}

export function navPermissionsToApi(keys: string[]): ControllerApiPermission[] {
  return [
    ...new Set(
      keys
        .map(navPermissionToApi)
        .filter((value): value is ControllerApiPermission => value != null),
    ),
  ]
}

export function apiPermissionsToNav(keys: string[], roleNavIds: string[]): string[] {
  const allowed = new Set(roleNavIds)
  const result = new Set<string>()

  for (const apiKey of keys) {
    if (!isControllerApiPermission(apiKey)) continue

    const matchingNavKeys = roleNavIds.filter((navKey) => NAV_TO_API[navKey] === apiKey)
    if (matchingNavKeys.length > 0) {
      matchingNavKeys.forEach((navKey) => result.add(navKey))
      continue
    }

    const preferred = API_TO_NAV_PREFERRED[apiKey]
    if (preferred && allowed.has(preferred)) {
      result.add(preferred)
    }
  }

  return [...result]
}

function normalizeStatus(status: string): ControllerStatus {
  if (status === 'active' || status === 'inactive' || status === 'suspended' || status === 'pending') {
    return status
  }
  return 'inactive'
}

export function mapControllerFromApi(
  doc: ControllerApiDoc,
  tenantUserId: string,
  roleNavIds: string[],
): StaffController {
  return {
    id: doc._id,
    tenantUserId,
    displayName: doc.staffName,
    email: doc.staffEmail,
    roleLabel: doc.roleName,
    status: normalizeStatus(doc.status),
    permissionKeys: apiPermissionsToNav(doc.permissions ?? [], roleNavIds),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function formValuesToCreatePayload(values: ControllerFormValues) {
  return {
    name: values.displayName.trim(),
    email: values.email.trim().toLowerCase(),
    roleName: values.roleLabel.trim(),
    permissions: navPermissionsToApi(values.permissionKeys),
  }
}

export function formValuesToUpdatePayload(values: ControllerFormValues) {
  return {
    ...formValuesToCreatePayload(values),
    status: values.status,
  }
}

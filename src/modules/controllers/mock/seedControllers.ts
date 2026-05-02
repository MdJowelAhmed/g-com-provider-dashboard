import type { Role } from '../../../types/role'
import type { StaffController } from '../types'

export function seedControllersForTenant(tenantUserId: string, dashboardRole: Role): StaffController[] {
  const now = new Date().toISOString()

  const servicesKeys: string[] = [
    'nav.overview',
    'nav.services',
    'nav.bookings',
    'nav.messages',
    'nav.posts',
  ]

  const stayKeys: string[] = [
    'nav.overview',
    'nav.rooms',
    'nav.reservations',
    'nav.guests',
    'nav.messages',
  ]

  const dineKeys: string[] = [
    'nav.overview',
    'nav.menu',
    'nav.orders',
    'nav.messages',
  ]

  const shopsKeys: string[] = [
    'nav.overview',
    'nav.products',
    'nav.orders',
    'nav.customers',
    'nav.messages',
  ]

  const eventsKeys: string[] = [
    'nav.overview',
    'nav.events',
    'nav.tickets',
    'nav.messages',
  ]

  const keysByRole: Record<Role, string[]> = {
    services: servicesKeys,
    stay: stayKeys,
    dine: dineKeys,
    shops: shopsKeys,
    events: eventsKeys,
  }

  const firstKeys = keysByRole[dashboardRole]

  return [
    {
      id: `ctl_${tenantUserId.slice(0, 8)}_a`,
      tenantUserId,
      displayName: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      roleLabel: 'Operations manager',
      status: 'active',
      permissionKeys: firstKeys,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `ctl_${tenantUserId.slice(0, 8)}_b`,
      tenantUserId,
      displayName: 'Sam Rivera',
      email: 'sam.r@example.com',
      roleLabel: 'Support lead',
      status: 'inactive',
      permissionKeys: ['nav.overview', 'nav.support', 'nav.messages'],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

import { AUTH_STORAGE_KEYS } from './session'
import { mapBusinessCategoryToRole, resolveRoleForMeta } from '../routing/roleRedirect'
import { apiPermissionsToNav } from '../modules/controllers/permissionMapping'
import { getAllowedNavPermissionIdsForRole } from '../modules/permissions/navPermissionMap'
import type { UserProfile } from '../redux/api/authApi'
import type { User } from '../types/user'

const STAFF_KEYS_EXTRA = 'staff_permission_keys'

export function mapUserProfileToUser(profile: UserProfile): User {
  const business = profile.business
  const tenantRole = business?.category
    ? mapBusinessCategoryToRole(business.category)
    : resolveRoleForMeta(profile.role)

  const extra: Record<string, string> = {
    apiRole: profile.role,
    category: business?.category ?? '',
    description: business?.description ?? '',
    businessLocation: business?.businessLocation ?? '',
    profileImage: profile.profileImage ?? '',
    businessLogo: business?.businessLogo ?? '',
    coverImage: business?.coverImage ?? '',
  }

  if (business?.socialLinks) {
    for (const [key, value] of Object.entries(business.socialLinks)) {
      if (typeof value === 'string') extra[`social_${key}`] = value
    }
  }

  // Staff accounts only see sidebar items granted in businessStaffPermission.
  if (profile.role === 'business_staff') {
    const roleNavIds = getAllowedNavPermissionIdsForRole(tenantRole)
    const navKeys = apiPermissionsToNav(profile.businessStaffPermission ?? [], roleNavIds)
    extra[STAFF_KEYS_EXTRA] = JSON.stringify(navKeys)
  }

  return {
    id: profile._id,
    email: profile.email,
    role: tenantRole,
    apiRole: profile.role,
    businessName: business?.businessName ?? '',
    ownerName: profile.name ?? '',
    phone: business?.businessPhone ?? profile.phone ?? '',
    address: business?.businessAddress ?? profile.address ?? '',
    stripeConnected: business?.paymentsActive ?? false,
    profileImage: profile.profileImage ?? '',
    extra,
  }
}

export function readStoredUser(): User | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.currentUser)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<User>
    if (!parsed.email || typeof parsed.email !== 'string') return null
    return parsed as User
  } catch {
    return null
  }
}

export function persistStoredUser(user: User) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(AUTH_STORAGE_KEYS.currentUser, JSON.stringify(user))
}

export function clearStoredUser() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser)
}

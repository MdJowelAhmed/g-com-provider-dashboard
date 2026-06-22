import type { Role } from './role'

export type User = {
  id: string
  email: string
  role: Role | string
  apiRole?: string
  businessName: string
  ownerName: string
  phone: string
  address: string
  profileImage?: string
  stripeConnected: boolean
  extra: Record<string, string>
}

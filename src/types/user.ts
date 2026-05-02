import type { Role } from './role'

export type User = {
  id: string
  email: string
  role: Role
  businessName: string
  ownerName: string
  phone: string
  address: string
  stripeConnected: boolean
  extra: Record<string, string>
}

export type ControllerStatus = 'active' | 'inactive' | 'suspended'

export type StaffController = {
  id: string
  tenantUserId: string
  displayName: string
  email: string
  roleLabel: string
  status: ControllerStatus
  permissionKeys: string[]
  createdAt: string
  updatedAt: string
}

export type ControllerFormValues = {
  displayName: string
  email: string
  roleLabel: string
  status: ControllerStatus
  permissionKeys: string[]
}

export type SortKey = 'displayName' | 'email' | 'roleLabel' | 'status' | 'updatedAt'
export type SortDir = 'asc' | 'desc'

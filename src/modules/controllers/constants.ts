import type { ControllerStatus } from './types'

/** Options shown in create/edit controller modal (Suspended appears only when editing a suspended row). */
export const CONTROLLER_MODAL_BASE_STATUS_OPTIONS: { value: Exclude<ControllerStatus, 'suspended'>; label: string }[] =
  [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

export const ALL_FILTER = '__all__'

export const DEFAULT_PAGE_SIZE = 8

export const STATUS_OPTIONS: { value: ControllerStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

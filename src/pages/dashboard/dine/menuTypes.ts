import type { PlatformCategory } from '../services/serviceTypes'

export type MenuStatus = 'active' | 'draft' | 'archived'

export type MenuItem = {
  id: string
  image: string
  name: string
  description: string
  price: number
  deliveryFee: number
  deliveryTime: string
  mainCategory?: string
  subCategory?: string
  subCategoryName?: string
  branch?: string
  branchName?: string
  businessCategory?: string
  businessCategoryName?: string
  status: MenuStatus
  createdAt: string
  updatedAt: string
}

export type MenuFormValues = Omit<
  MenuItem,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'mainCategory'
> & {
  category: PlatformCategory | ''
  imageFile: File | null
}

export const MENU_STATUS_OPTIONS: { value: MenuStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

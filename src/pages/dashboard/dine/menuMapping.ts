import type { ProductApiDoc, ProductPayload, ProductRelationRef } from '../../../redux/api/productsApi'
import { dashboardRoleToPlatformCategory } from '../services/serviceTypes'
import type { MenuFormValues, MenuItem } from './menuTypes'

function refId(ref: ProductRelationRef): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref._id
}

function refName(ref: ProductRelationRef): string {
  if (!ref || typeof ref === 'string') return ''
  if ('name' in ref && ref.name) return ref.name
  if ('branchName' in ref && ref.branchName) return ref.branchName
  return ''
}

function normalizeStatus(status: string | undefined): MenuItem['status'] {
  const normalized = status === 'archive' ? 'archived' : status
  if (normalized === 'active' || normalized === 'draft') return normalized
  return 'archived'
}

export function mapMenuItemFromApi(doc: ProductApiDoc): MenuItem {
  return {
    id: doc._id,
    image: doc.image ?? '',
    name: doc.name ?? '',
    description: doc.description ?? '',
    price: doc.price ?? 0,
    deliveryFee: doc.deliveryFee ?? 0,
    deliveryTime:
      typeof doc.deliveryTime === 'string'
        ? doc.deliveryTime
        : doc.deliveryTime != null
          ? String(doc.deliveryTime)
          : '',
    mainCategory: doc.mainCategory,
    subCategory: refId(doc.subCategory),
    subCategoryName: refName(doc.subCategory),
    branch: refId(doc.branch),
    branchName: refName(doc.branch),
    businessCategory: refId(doc.businessCategory),
    businessCategoryName: refName(doc.businessCategory),
    status: normalizeStatus(doc.status),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function menuItemToFormValues(item: MenuItem): Omit<MenuFormValues, 'imageFile'> {
  return {
    image: item.image,
    name: item.name,
    description: item.description,
    price: item.price,
    deliveryFee: item.deliveryFee,
    deliveryTime: item.deliveryTime,
    category: item.mainCategory
      ? dashboardRoleToPlatformCategory(item.mainCategory)
      : '',
    subCategory: item.subCategory ?? '',
    branch: item.branch ?? '',
    businessCategory: item.businessCategory ?? '',
  }
}

export function formValuesToMenuPayload(
  values: Omit<MenuFormValues, 'imageFile'>,
): ProductPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    deliveryFee: Number(values.deliveryFee),
    deliveryTime: String(values.deliveryTime),
    image: values.image.trim(),
    businessCategory: values.businessCategory || undefined,
    subCategory: values.subCategory || undefined,
    branch: values.branch || undefined,
  }
}

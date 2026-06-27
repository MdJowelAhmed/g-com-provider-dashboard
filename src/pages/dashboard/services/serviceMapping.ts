import type { ServiceApiDoc, ServicePayload, ServiceRelationRef } from '../../../redux/api/serviceApi'
import { dashboardRoleToPlatformCategory, type PlatformCategory } from './serviceTypes'
import type { Service, ServiceFormValues } from './serviceTypes'

function relationId(value: ServiceRelationRef): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id ?? ''
}

function relationName(value: ServiceRelationRef): string | undefined {
  if (!value || typeof value === 'string') return undefined
  if ('branchName' in value) return value.branchName
  if ('name' in value) return value.name
  return undefined
}

function normalizePlatformCategory(value: string | undefined): PlatformCategory | '' {
  if (!value?.trim()) return ''
  return dashboardRoleToPlatformCategory(value)
}

export function mapServiceFromApi(doc: ServiceApiDoc): Service {
  return {
    id: doc._id,
    name: doc.name,
    serviceCode: doc.serviceCode,
    platformCategory: normalizePlatformCategory(doc.mainCategory),
    subCategoryId: relationId(doc.subCategory),
    subCategoryName: relationName(doc.subCategory),
    businessCategoryId: relationId(doc.businessCategory),
    businessCategoryName: relationName(doc.businessCategory),
    branchId: relationId(doc.branch),
    branchName: relationName(doc.branch),
    description: doc.description,
    pricingType: doc.pricingType,
    price: doc.price,
    duration: doc.duration,
    maxBookingPerDay: doc.maxBookingPerDay,
    image: doc.image,
    status: doc.status ?? 'active',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function serviceToFormValues(service: Service): ServiceFormValues {
  return {
    name: service.name,
    serviceCode: service.serviceCode,
    platformCategory: service.platformCategory,
    subCategory: service.subCategoryId,
    businessCategory: service.businessCategoryId,
    description: service.description,
    pricingType: service.pricingType,
    price: service.price,
    duration: service.duration,
    maxBookingPerDay: service.maxBookingPerDay,
    branch: service.branchId,
    image: service.image,
  }
}

export function formValuesToServicePayload(values: ServiceFormValues): ServicePayload {
  return {
    name: values.name.trim(),
    serviceCode: values.serviceCode.trim(),
    subCategory: values.subCategory,
    businessCategory: values.businessCategory,
    description: values.description.trim(),
    pricingType: values.pricingType,
    price: Number(values.price),
    duration: String(values.duration).trim(),
    maxBookingPerDay: Number(values.maxBookingPerDay),
    branch: values.branch,
    image: values.image.trim(),
  }
}

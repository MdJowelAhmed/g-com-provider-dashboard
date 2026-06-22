import type { ServiceApiDoc, ServicePayload } from '../../../redux/api/serviceApi'
import type { Service, ServiceFormValues } from './serviceTypes'

export function mapServiceFromApi(doc: ServiceApiDoc): Service {
  return {
    id: doc._id,
    name: doc.name,
    serviceCode: doc.serviceCode,
    subCategoryId: doc.subCategory,
    businessCategoryId: doc.businessCategory,
    branchId: doc.branch,
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
    platformCategory: '',
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

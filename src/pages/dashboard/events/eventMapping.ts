import type { EventApiDoc, EventPayload, EventRelationRef } from '../../../redux/api/eventApi'
import type { Event, EventFormValues } from './eventTypes'

function relationId(value: EventRelationRef): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id ?? ''
}

function relationName(value: EventRelationRef): string | undefined {
  if (!value || typeof value === 'string') return undefined
  if ('branchName' in value) return value.branchName
  if ('name' in value) return value.name
  return undefined
}

export function mapEventFromApi(doc: EventApiDoc): Event {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description,
    startTime: doc.startTime,
    endTime: doc.endTime,
    registrationDeadline: doc.registrationDeadline,
    location: doc.location ?? null,
    maxCapacity: doc.maxCapacity,
    bookedCapacity: doc.bookedCapacity ?? 0,
    ticketPrice: doc.ticketPrice,
    image: doc.image,
    status: doc.status ?? 'active',
    mainCategory: doc.mainCategory,
    organizerName: doc.organizerName,
    branchId: relationId(doc.branch),
    branchName: relationName(doc.branch),
    subCategoryId: relationId(doc.subCategory),
    subCategoryName: relationName(doc.subCategory),
    businessCategoryId: relationId(doc.businessCategory),
    businessCategoryName: relationName(doc.businessCategory),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function eventToFormValues(event: Event): EventFormValues {
  const [lng, lat] = event.location?.coordinates ?? [null, null]
  return {
    name: event.name,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    registrationDeadline: event.registrationDeadline,
    locationName: '',
    latitude: lat ?? null,
    longitude: lng ?? null,
    maxCapacity: event.maxCapacity,
    ticketPrice: event.ticketPrice,
    image: event.image,
    subCategory: event.subCategoryId ?? '',
    businessCategory: event.businessCategoryId ?? '',
    organizerName: event.organizerName ?? '',
    branch: event.branchId ?? '',
  }
}

export function formValuesToEventPayload(values: EventFormValues): EventPayload {
  const payload: EventPayload = {
    name: values.name.trim(),
    description: values.description.trim(),
    startTime: values.startTime,
    endTime: values.endTime,
    registrationDeadline: values.registrationDeadline,
    location: {
      type: 'Point',
      coordinates: [Number(values.longitude), Number(values.latitude)],
    },
    maxCapacity: Number(values.maxCapacity),
    ticketPrice: Number(values.ticketPrice),
    image: values.image.trim(),
  }

  if (values.subCategory.trim()) payload.subCategory = values.subCategory.trim()
  if (values.businessCategory.trim()) payload.businessCategory = values.businessCategory.trim()
  if (values.organizerName.trim()) payload.organizerName = values.organizerName.trim()
  if (values.branch.trim()) payload.branch = values.branch.trim()

  return payload
}

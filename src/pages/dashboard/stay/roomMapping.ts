import type { RoomApiDoc, RoomPayload, RoomRelationRef } from '../../../redux/api/roomApi'
import { dashboardRoleToPlatformCategory } from '../services/serviceTypes'
import type { Room, RoomFormValues } from './roomTypes'

function relationId(value: RoomRelationRef): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id ?? ''
}

function relationName(value: RoomRelationRef): string | undefined {
  if (!value || typeof value === 'string') return undefined
  if ('branchName' in value) return value.branchName
  if ('name' in value) return value.name
  return undefined
}

export function mapRoomFromApi(doc: RoomApiDoc): Room {
  return {
    id: doc._id,
    name: doc.name,
    roomNumber: doc.roomNumber,
    roomCode: doc.roomCode,
    roomType: doc.roomType,
    bedType: doc.bedType,
    size: doc.size,
    basePrice: doc.basePrice,
    subCategoryId: relationId(doc.subCategory),
    subCategoryName: relationName(doc.subCategory),
    businessCategoryId: relationId(doc.businessCategory),
    businessCategoryName: relationName(doc.businessCategory),
    branchId: relationId(doc.branch),
    branchName: relationName(doc.branch),
    description: doc.description,
    bedCount: doc.bedCount,
    maxAdult: doc.maxAdult,
    maxChildren: doc.maxChildren,
    totalGuest: doc.totalGuest,
    otherAmenities: doc.otherAmenities ?? [],
    image: doc.image,
    status: doc.status ?? 'active',
    mainCategory: doc.mainCategory,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function roomToFormValues(room: Room): RoomFormValues {
  return {
    name: room.name,
    roomNumber: room.roomNumber,
    roomCode: room.roomCode,
    roomType: room.roomType,
    bedType: room.bedType,
    size: room.size,
    basePrice: room.basePrice,
    category: room.mainCategory
      ? dashboardRoleToPlatformCategory(room.mainCategory)
      : '',
    subCategory: room.subCategoryId,
    businessCategory: room.businessCategoryId,
    branch: room.branchId,
    description: room.description,
    bedCount: room.bedCount,
    maxAdult: room.maxAdult,
    maxChildren: room.maxChildren,
    totalGuest: room.totalGuest,
    otherAmenities: room.otherAmenities,
    image: room.image,
  }
}

export function formValuesToRoomPayload(values: RoomFormValues): RoomPayload {
  return {
    name: values.name.trim(),
    roomNumber: values.roomNumber.trim(),
    roomCode: values.roomCode.trim(),
    roomType: values.roomType.trim(),
    bedType: values.bedType.trim(),
    size: values.size.trim(),
    basePrice: Number(values.basePrice),
    subCategory: values.subCategory,
    businessCategory: values.businessCategory,
    description: values.description.trim(),
    bedCount: Number(values.bedCount),
    maxAdult: Number(values.maxAdult),
    maxChildren: Number(values.maxChildren),
    totalGuest: Number(values.totalGuest),
    otherAmenities: values.otherAmenities,
    branch: values.branch,
    image: values.image.trim(),
  }
}

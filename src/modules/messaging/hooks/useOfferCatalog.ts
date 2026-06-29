import { useMemo } from 'react'
import { useGetRoomsQuery } from '../../../redux/api/roomApi'
import { useGetServicesQuery } from '../../../redux/api/serviceApi'
import { mapRoomFromApi } from '../../../pages/dashboard/stay/roomMapping'
import { mapServiceFromApi } from '../../../pages/dashboard/services/serviceMapping'
import type { BusinessMainCategory } from '../../../types/businessCategory'
import { BUSINESS_MAIN_CATEGORIES } from '../../../types/businessCategory'
import { normalizeBusinessCategory } from '../utils/offerHelpers'

export type OfferCatalogItem = {
  id: string
  name: string
  description: string
  price: number
  subtitle?: string
}

function matchesCategory(mainCategory: string | undefined, category: BusinessMainCategory) {
  const main = (mainCategory ?? BUSINESS_MAIN_CATEGORIES.SERVICES).toLowerCase()
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
      return main === 'services' || main === 'service'
    case BUSINESS_MAIN_CATEGORIES.SHOP:
      return main === 'shop' || main === 'shops'
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return main === 'dine' || main === 'restaurant'
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return main === 'event' || main === 'events'
    default:
      return false
  }
}

export function useOfferCatalog(categoryInput?: string) {
  const category = normalizeBusinessCategory(categoryInput)
  const isStay = category === BUSINESS_MAIN_CATEGORIES.STAY

  const {
    data: servicesData,
    isLoading: servicesLoading,
    isFetching: servicesFetching,
  } = useGetServicesQuery({ page: 1, limit: 100 }, { skip: isStay })

  const {
    data: roomsData,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
  } = useGetRoomsQuery({ page: 1, limit: 100 }, { skip: !isStay })

  const items = useMemo((): OfferCatalogItem[] => {
    if (isStay) {
      return (roomsData?.data ?? []).map((doc) => {
        const room = mapRoomFromApi(doc)
        return {
          id: room.id,
          name: room.name,
          description: room.description,
          price: room.basePrice,
          subtitle: `${room.roomType} · #${room.roomNumber}`,
        }
      })
    }

    return (servicesData?.data ?? [])
      .filter((doc) => matchesCategory(doc.mainCategory, category))
      .map((doc) => {
        const service = mapServiceFromApi(doc)
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          subtitle: service.serviceCode,
        }
      })
  }, [category, isStay, roomsData?.data, servicesData?.data])

  return {
    category,
    items,
    isLoading: isStay ? roomsLoading : servicesLoading,
    isFetching: isStay ? roomsFetching : servicesFetching,
  }
}

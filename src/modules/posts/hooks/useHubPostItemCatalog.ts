import { useMemo } from 'react'
import { useGetEventsQuery } from '../../../redux/api/eventApi'
import { useGetProductsQuery } from '../../../redux/api/productsApi'
import { useGetRoomsQuery } from '../../../redux/api/roomApi'
import { useGetServicesQuery } from '../../../redux/api/serviceApi'
import { mapEventFromApi } from '../../../pages/dashboard/events/eventMapping'
import { mapRoomFromApi } from '../../../pages/dashboard/stay/roomMapping'
import { mapServiceFromApi } from '../../../pages/dashboard/services/serviceMapping'
import type { Role } from '../../../types/role'

export type HubPostItemType = 'product' | 'room' | 'event' | 'service'

export type HubPostCatalogItem = {
  id: string
  label: string
  price: number
}

export function getHubPostItemType(role: Role): HubPostItemType {
  switch (role) {
    case 'shops':
    case 'dine':
      return 'product'
    case 'stay':
      return 'room'
    case 'events':
      return 'event'
    case 'services':
      return 'service'
  }
}

export function getHubPostItemLabel(role: Role): string {
  switch (role) {
    case 'shops':
    case 'dine':
      return 'Product'
    case 'stay':
      return 'Room'
    case 'events':
      return 'Event'
    case 'services':
      return 'Service'
  }
}

function matchesProductRole(mainCategory: string | undefined, role: Role) {
  const main = (mainCategory ?? '').toLowerCase()
  if (role === 'shops') return !main || main === 'shop' || main === 'shops'
  if (role === 'dine') return !main || main === 'dine' || main === 'restaurant'
  return false
}

export function useHubPostItemCatalog(role: Role) {
  const itemType = getHubPostItemType(role)
  const itemLabel = getHubPostItemLabel(role)

  const isProduct = itemType === 'product'
  const isRoom = itemType === 'room'
  const isEvent = itemType === 'event'
  const isService = itemType === 'service'

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useGetProductsQuery({ page: 1, limit: 100 }, { skip: !isProduct })

  const {
    data: roomsData,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
  } = useGetRoomsQuery({ page: 1, limit: 100 }, { skip: !isRoom })

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
  } = useGetEventsQuery({ page: 1, limit: 100 }, { skip: !isEvent })

  const {
    data: servicesData,
    isLoading: servicesLoading,
    isFetching: servicesFetching,
  } = useGetServicesQuery({ page: 1, limit: 100 }, { skip: !isService })

  const items = useMemo((): HubPostCatalogItem[] => {
    if (isProduct) {
      return (productsData?.data ?? [])
        .filter((doc) => matchesProductRole(doc.mainCategory, role))
        .map((doc) => ({
          id: doc._id,
          label: doc.sku ? `${doc.name} (${doc.sku})` : doc.name,
          price: doc.price ?? 0,
        }))
    }

    if (isRoom) {
      return (roomsData?.data ?? []).map((doc) => {
        const room = mapRoomFromApi(doc)
        return {
          id: room.id,
          label: room.roomNumber ? `${room.name} (#${room.roomNumber})` : room.name,
          price: room.basePrice,
        }
      })
    }

    if (isEvent) {
      return (eventsData?.data ?? []).map((doc) => {
        const event = mapEventFromApi(doc)
        return {
          id: event.id,
          label: event.name,
          price: event.ticketPrice,
        }
      })
    }

    return (servicesData?.data ?? []).map((doc) => {
      const service = mapServiceFromApi(doc)
      return {
        id: service.id,
        label: service.serviceCode ? `${service.name} (${service.serviceCode})` : service.name,
        price: service.price,
      }
    })
  }, [
    eventsData?.data,
    isEvent,
    isProduct,
    isRoom,
    productsData?.data,
    role,
    roomsData?.data,
    servicesData?.data,
  ])

  const labelById = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      map.set(item.id, item.label)
    }
    return map
  }, [items])

  const isLoading = isProduct
    ? productsLoading
    : isRoom
      ? roomsLoading
      : isEvent
        ? eventsLoading
        : servicesLoading

  const isFetching = isProduct
    ? productsFetching
    : isRoom
      ? roomsFetching
      : isEvent
        ? eventsFetching
        : servicesFetching

  return {
    itemType,
    itemLabel,
    items,
    labelById,
    isLoading,
    isFetching,
  }
}

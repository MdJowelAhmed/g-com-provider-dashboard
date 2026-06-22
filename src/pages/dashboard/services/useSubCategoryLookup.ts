import { useMemo } from 'react'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import { PLATFORM_CATEGORIES, type PlatformCategory } from './serviceTypes'

export function useSubCategoryLookup() {
  const servicesQuery = useGetSubCategoriesQuery({ category: 'services', page: 1, limit: 100 })
  const stayQuery = useGetSubCategoriesQuery({ category: 'stay', page: 1, limit: 100 })
  const dineQuery = useGetSubCategoriesQuery({ category: 'dine', page: 1, limit: 100 })
  const shopQuery = useGetSubCategoriesQuery({ category: 'shop', page: 1, limit: 100 })
  const eventQuery = useGetSubCategoriesQuery({ category: 'event', page: 1, limit: 100 })

  const queries = [servicesQuery, stayQuery, dineQuery, shopQuery, eventQuery]

  return useMemo(() => {
    const nameById = new Map<string, string>()
    const platformById = new Map<string, PlatformCategory>()

    PLATFORM_CATEGORIES.forEach((platform, index) => {
      for (const item of queries[index].data?.data ?? []) {
        nameById.set(item._id, item.name)
        platformById.set(item._id, platform)
      }
    })

    return {
      nameById,
      platformById,
      isLoading: queries.some((query) => query.isLoading || query.isFetching),
    }
  }, [
    servicesQuery.data,
    stayQuery.data,
    dineQuery.data,
    shopQuery.data,
    eventQuery.data,
    servicesQuery.isLoading,
    servicesQuery.isFetching,
    stayQuery.isLoading,
    stayQuery.isFetching,
    dineQuery.isLoading,
    dineQuery.isFetching,
    shopQuery.isLoading,
    shopQuery.isFetching,
    eventQuery.isLoading,
    eventQuery.isFetching,
  ])
}

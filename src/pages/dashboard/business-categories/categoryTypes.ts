import type {
  BusinessCategoryDoc,
  BusinessCategoryStatus,
} from '../../../redux/api/businessCategoryApi'

export type BusinessCategory = {
  id: string
  sl: string
  name: string
  itemCount: number
  status: BusinessCategoryStatus
}

export function mapCategoryFromApi(doc: BusinessCategoryDoc, index: number): BusinessCategory {
  return {
    id: doc._id,
    sl: String(index + 1).padStart(2, '0'),
    name: doc.name,
    itemCount: doc.itemCount ?? 0,
    status: doc.status,
  }
}

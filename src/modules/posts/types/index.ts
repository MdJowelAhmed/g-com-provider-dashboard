import type { Role } from '../../../types/role'
import type { HubPostPanel } from '../../../redux/api/hubPostApi'

/** Derived from campaign start/end — table filter + badge */
export type CampaignDisplayStatus = 'active' | 'upcoming' | 'expired'

export type PostMedia = {
  id: string
  kind: 'image' | 'video'
  url: string
  name: string
  sizeBytes?: number
}

export type Post = {
  id: string
  role: Role
  itemId: string
  panel: HubPostPanel
  caption: string
  mediaUrl: string
  itemPrice: number
  startDate: string
  endDate: string
  category?: string
  likesCount: number
  commentCount: number
  shareCount: number
  isTrending: boolean
  createdAt: string
  updatedAt: string
}

export type SortKey =
  | 'panel'
  | 'itemId'
  | 'about'
  | 'amount'
  | 'startAt'
  | 'endAt'
  | 'campaignStatus'
  | 'updatedAt'
export type SortDir = 'asc' | 'desc'

export type PostFormValues = {
  itemId: string
  panel: HubPostPanel
  caption: string
  media: string
  itemPrice: string
  startDate: string
  endDate: string
}

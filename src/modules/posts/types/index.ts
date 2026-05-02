import type { Role } from '../../../types/role'

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

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
  title: string
  excerpt: string
  body: string
  postType: string
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  media: PostMedia[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

/** Derived from campaign start/end — table filter + badge */
export type CampaignDisplayStatus = 'active' | 'upcoming' | 'expired'

export type SortKey =
  | 'shopName'
  | 'productName'
  | 'about'
  | 'amount'
  | 'startAt'
  | 'endAt'
  | 'campaignStatus'
  | 'updatedAt'
export type SortDir = 'asc' | 'desc'

/** Create/edit post modal — maps to stored `Post` via `postFormMapping` */
export type PostFormValues = {
  shopId: string
  productId: string
  totalAmount: string
  startLocal: string
  endLocal: string
  about: string
  media: PostMedia[]
}

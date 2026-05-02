import type { CampaignDisplayStatus } from './types'

export const ALL_FILTER = '__all__'

export const CAMPAIGN_STATUS_FILTER_OPTIONS: {
  value: CampaignDisplayStatus
  label: string
}[] = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'expired', label: 'Expired' },
]

export const TITLE_MAX = 120
export const BODY_MAX = 5000
export const EXCERPT_MAX = 280

export const DEFAULT_PAGE_SIZE = 8

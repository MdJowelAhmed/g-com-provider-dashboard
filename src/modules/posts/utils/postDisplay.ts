import type { CampaignDisplayStatus, Post, PostMedia } from '../types'
import { getItemDisplayLabel, getPanelDisplayLabel } from './hubPostMapping'

export type PostDisplayRow = {
  panel: string
  itemLabel: string
  about: string
  amount: string
  startLocal: string
  endLocal: string
  campaignStatus: CampaignDisplayStatus | null
  media: PostMedia[]
}

export function parseLocalDate(value: string): Date | null {
  const t = value?.trim()
  if (!t) return null
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getCampaignDisplayStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): CampaignDisplayStatus | null {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  if (!start || !end) return null

  const endOfDay = new Date(end)
  endOfDay.setHours(23, 59, 59, 999)

  if (now < start) return 'upcoming'
  if (now > endOfDay) return 'expired'
  return 'active'
}

export function getPostDisplayRow(post: Post): PostDisplayRow {
  const media: PostMedia[] = post.mediaUrl
    ? [
        {
          id: `${post.id}_media`,
          kind: 'image',
          url: post.mediaUrl,
          name: 'media',
        },
      ]
    : []

  return {
    panel: getPanelDisplayLabel(post.panel),
    itemLabel: getItemDisplayLabel(post.itemId),
    about: post.caption.trim(),
    amount: Number.isFinite(post.itemPrice) ? post.itemPrice.toFixed(2) : '—',
    startLocal: post.startDate,
    endLocal: post.endDate,
    campaignStatus: getCampaignDisplayStatus(post.startDate, post.endDate),
    media,
  }
}

export function parseAmountSort(amount: string): number {
  const n = parseFloat(amount.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function campaignStatusOrder(s: CampaignDisplayStatus | null): number {
  if (s === null) return -1
  if (s === 'upcoming') return 0
  if (s === 'active') return 1
  return 2
}

export function localDateTimeMs(value: string): number {
  const d = parseLocalDate(value)
  return d ? d.getTime() : 0
}

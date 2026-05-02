import type { CampaignDisplayStatus, Post, PostMedia } from '../types'
import { parseMetaFromBody, productLabel, shopLabel } from './postFormMapping'

export type PostDisplayRow = {
  shopName: string
  productName: string
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

/** Compare `now` to [start, end] using parsed datetime-local values. */
export function getCampaignDisplayStatus(
  startLocal: string,
  endLocal: string,
  now: Date = new Date(),
): CampaignDisplayStatus | null {
  const start = parseLocalDate(startLocal)
  const end = parseLocalDate(endLocal)
  if (!start || !end) return null
  if (now < start) return 'upcoming'
  if (now > end) return 'expired'
  return 'active'
}

export function getPostDisplayRow(post: Post): PostDisplayRow {
  const parsed = parseMetaFromBody(post.body)
  const shopName = shopLabel(parsed.shopId ?? '')
  const productName = parsed.productId
    ? productLabel(parsed.productId)
    : (post.title ?? '').trim()
  const about = (parsed.about ?? '').trim()
  const amount = (parsed.totalAmount ?? '').trim()
  const startLocal = parsed.startLocal ?? ''
  const endLocal = parsed.endLocal ?? ''

  return {
    shopName,
    productName,
    about,
    amount,
    startLocal,
    endLocal,
    campaignStatus: getCampaignDisplayStatus(startLocal, endLocal),
    media: post.media,
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

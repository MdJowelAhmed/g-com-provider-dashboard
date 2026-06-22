import type { HubPostApiDoc, HubPostPayload } from '../../../redux/api/hubPostApi'
import type { Role } from '../../../types/role'
import type { Post, PostFormValues } from '../types'

export const HUB_POST_PANEL_OPTIONS = [
  { value: 'both', label: 'Hub & Business' },
  { value: 'hub', label: 'Hub only' },
  { value: 'business', label: 'Business only' },
] as const

function toDateInput(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function formatItemLabel(itemId: string) {
  if (!itemId) return '—'
  if (itemId.length <= 12) return itemId
  return `${itemId.slice(0, 8)}…${itemId.slice(-4)}`
}

export function mapHubPostFromApi(doc: HubPostApiDoc, role: Role): Post {
  return {
    id: doc._id,
    role,
    itemId: doc.itemId,
    panel: doc.panel,
    caption: doc.caption,
    mediaUrl: doc.media,
    itemPrice: doc.itemPrice,
    startDate: doc.startDate,
    endDate: doc.endDate,
    category: doc.category,
    likesCount: doc.likesCount ?? 0,
    commentCount: doc.commentCount ?? 0,
    shareCount: doc.shareCount ?? 0,
    isTrending: doc.isTrending ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function postToFormValues(post: Post): PostFormValues {
  return {
    itemId: post.itemId,
    panel: post.panel,
    caption: post.caption,
    media: post.mediaUrl,
    itemPrice: String(post.itemPrice),
    startDate: toDateInput(post.startDate),
    endDate: toDateInput(post.endDate),
  }
}

export function formValuesToHubPostPayload(values: PostFormValues): HubPostPayload {
  return {
    itemId: values.itemId.trim(),
    panel: values.panel,
    caption: values.caption.trim(),
    media: values.media.trim(),
    itemPrice: Number(values.itemPrice),
    startDate: values.startDate,
    endDate: values.endDate,
  }
}

export function getItemDisplayLabel(itemId: string) {
  return formatItemLabel(itemId)
}

export function getPanelDisplayLabel(panel: Post['panel']) {
  return HUB_POST_PANEL_OPTIONS.find((option) => option.value === panel)?.label ?? panel
}

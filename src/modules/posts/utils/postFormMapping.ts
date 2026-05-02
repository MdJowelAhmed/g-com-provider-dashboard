import type { RolePostConfig } from '../config/rolePostConfig'
import type { Post, PostFormValues } from '../types'

const META_MARK = '\n---META\n'

/** Demo catalog — replace with API shop/product lists when wired */
export const MOCK_SHOPS = [
  { id: 'shop_main', name: 'Main store' },
  { id: 'shop_branch', name: 'Branch' },
  { id: 'shop_online', name: 'Online only' },
] as const

export const MOCK_PRODUCTS = [
  { id: 'pr_1', shopId: 'shop_main', name: 'Signature bundle' },
  { id: 'pr_2', shopId: 'shop_main', name: 'Seasonal set' },
  { id: 'pr_3', shopId: 'shop_branch', name: 'Local promo pack' },
  { id: 'pr_4', shopId: 'shop_online', name: 'Digital gift card' },
] as const

export function productsForShop(shopId: string) {
  return MOCK_PRODUCTS.filter((p) => p.shopId === shopId)
}

export function productLabel(productId: string) {
  return MOCK_PRODUCTS.find((p) => p.id === productId)?.name ?? 'Post'
}

export function shopLabel(shopId: string) {
  return MOCK_SHOPS.find((s) => s.id === shopId)?.name ?? ''
}

export function buildBodyWithMeta(values: PostFormValues): string {
  const meta = {
    shopId: values.shopId,
    productId: values.productId,
    totalAmount: values.totalAmount,
    startLocal: values.startLocal,
    endLocal: values.endLocal,
  }
  return `${values.about.trim()}${META_MARK}${JSON.stringify(meta)}`
}

export function stripMetaFromBody(body: string): string {
  const idx = body.lastIndexOf(META_MARK)
  if (idx === -1) return body.trim()
  return body.slice(0, idx).trim()
}

export function parseMetaFromBody(body: string): Partial<PostFormValues> & { about: string } {
  const idx = body.lastIndexOf(META_MARK)
  if (idx === -1) {
    return {
      about: body.trim(),
      shopId: MOCK_SHOPS[0]?.id ?? '',
      productId: '',
      totalAmount: '',
      startLocal: '',
      endLocal: '',
    }
  }
  const about = body.slice(0, idx).trim()
  try {
    const meta = JSON.parse(body.slice(idx + META_MARK.length)) as Partial<PostFormValues>
    return {
      about,
      shopId: meta.shopId ?? MOCK_SHOPS[0]?.id ?? '',
      productId: meta.productId ?? '',
      totalAmount: meta.totalAmount ?? '',
      startLocal: meta.startLocal ?? '',
      endLocal: meta.endLocal ?? '',
    }
  } catch {
    return {
      about: body.trim(),
      shopId: MOCK_SHOPS[0]?.id ?? '',
      productId: '',
      totalAmount: '',
      startLocal: '',
      endLocal: '',
    }
  }
}

export function postToFormValues(post: Post): PostFormValues {
  const parsed = parseMetaFromBody(post.body)
  return {
    shopId: parsed.shopId || MOCK_SHOPS[0]?.id || '',
    productId: parsed.productId || MOCK_PRODUCTS.find((p) => p.name === post.title)?.id || '',
    totalAmount: parsed.totalAmount ?? '',
    startLocal: parsed.startLocal ?? '',
    endLocal: parsed.endLocal ?? '',
    about: parsed.about || post.title,
    media: post.media.map((m) => ({ ...m })),
  }
}

export function mapFormValuesToPostFields(
  values: PostFormValues,
  config: RolePostConfig,
): Pick<
  Post,
  | 'title'
  | 'excerpt'
  | 'body'
  | 'postType'
  | 'status'
  | 'scheduledAt'
  | 'publishedAt'
  | 'media'
  | 'featured'
> {
  const now = new Date().toISOString()
  const title = productLabel(values.productId)
  const excerpt = values.about.trim().slice(0, 280)
  const body = buildBodyWithMeta(values)
  const postType = config.postTypeOptions[0]?.value ?? 'announcement'

  return {
    title,
    excerpt,
    body,
    postType,
    status: 'published',
    scheduledAt: null,
    publishedAt: now,
    media: values.media,
    featured: false,
  }
}

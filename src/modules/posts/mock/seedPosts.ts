import type { Role } from '../../../types/role'
import type { Post, PostFormValues } from '../types'
import { getRolePostConfig } from '../config/rolePostConfig'
import { mapFormValuesToPostFields } from '../utils/postFormMapping'

function id(prefix: string, i: number) {
  return `${prefix}_${i}`
}

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/** Browser-local `datetime-local` string */
function localDt(dayOffset: number, hour: number, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  const p = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function seedPostsForRole(role: Role): Post[] {
  const cfg = getRolePostConfig(role)

  const seeds: PostFormValues[] = [
    {
      shopId: 'shop_main',
      productId: 'pr_1',
      totalAmount: '189.00',
      startLocal: localDt(-1, 8),
      endLocal: localDt(5, 22),
      about: 'Weekend bundle spotlight — curated picks customers love.',
      media: [],
    },
    {
      shopId: 'shop_branch',
      productId: 'pr_3',
      totalAmount: '72.50',
      startLocal: localDt(7, 10),
      endLocal: localDt(14, 20),
      about: 'Branch promo pack — book ahead for local pickup.',
      media: [],
    },
    {
      shopId: 'shop_online',
      productId: 'pr_4',
      totalAmount: '25.00',
      startLocal: localDt(-40, 9),
      endLocal: localDt(-3, 23, 59),
      about: 'Digital gift card wave — campaign ended.',
      media: [],
    },
    {
      shopId: 'shop_main',
      productId: 'pr_2',
      totalAmount: '310.00',
      startLocal: localDt(-14, 12),
      endLocal: localDt(-2, 18),
      about: 'Seasonal set recap — strong conversion last cycle.',
      media: [],
    },
    {
      shopId: 'shop_online',
      productId: 'pr_4',
      totalAmount: '40.00',
      startLocal: localDt(2, 6),
      endLocal: localDt(30, 23),
      about: 'Extended online-only perks window.',
      media: [],
    },
    {
      shopId: 'shop_branch',
      productId: 'pr_3',
      totalAmount: '95.99',
      startLocal: localDt(-60, 8),
      endLocal: localDt(-45, 17),
      about: 'Archived branch campaign — kept for reference.',
      media: [],
    },
  ]

  const created = isoDaysAgo(21)

  return seeds.map((values, i) => {
    const fields = mapFormValuesToPostFields(values, cfg)
    const item: Post = {
      id: id(role, i + 1),
      role,
      ...fields,
      createdAt: created,
      updatedAt: isoDaysAgo(i % 5),
    }
    return item
  })
}

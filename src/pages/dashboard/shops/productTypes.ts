export type ProductStatus = 'active' | 'draft' | 'archived'

export type Product = {
  id: string
  image: string
  name: string
  sku: string
  description: string
  category: string
  brand: string
  price: number
  salePrice?: number | null
  costPrice?: number | null
  stock: number
  lowStockThreshold: number
  weight?: number | null
  variants: string
  tags: string
  status: ProductStatus
  hidden: boolean
  featured: boolean
  createdAt: string
}

export const PRODUCT_CATEGORIES = [
  'Fashion',
  'Electronics',
  'Grocery',
  'Beauty',
  'Home & Living',
  'Books',
  'Sports',
  'Toys',
  'Other',
]

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p_1001',
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=200&q=80',
    name: 'Classic Denim Jacket',
    sku: 'DJ-001',
    description: 'Vintage wash denim jacket with button closure and chest pockets.',
    category: 'Fashion',
    brand: 'Urban Thread',
    price: 65,
    salePrice: 49,
    costPrice: 28,
    stock: 24,
    lowStockThreshold: 5,
    weight: 680,
    variants: 'S, M, L, XL',
    tags: 'denim, jacket, unisex',
    status: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-03-04T09:10:00.000Z',
  },
  {
    id: 'p_1002',
    image:
      'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=200&q=80',
    name: 'Wireless Headphones',
    sku: 'WH-210',
    description: 'Over-ear wireless headphones with 30h battery and active noise cancelling.',
    category: 'Electronics',
    brand: 'SonicWave',
    price: 120,
    salePrice: null,
    costPrice: 72,
    stock: 8,
    lowStockThreshold: 10,
    weight: 310,
    variants: 'Black, White, Sand',
    tags: 'audio, wireless, anc',
    status: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-02-18T14:40:00.000Z',
  },
  {
    id: 'p_1003',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=200&q=80',
    name: 'Leather Wallet',
    sku: 'LW-045',
    description: 'Full-grain leather bi-fold wallet with RFID-blocking lining.',
    category: 'Fashion',
    brand: 'Saddle & Co.',
    price: 35,
    salePrice: null,
    costPrice: 14,
    stock: 40,
    lowStockThreshold: 8,
    weight: 90,
    variants: 'Brown, Black',
    tags: 'wallet, leather, men',
    status: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-01-22T11:05:00.000Z',
  },
  {
    id: 'p_1004',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
    name: 'Running Shoes',
    sku: 'RS-114',
    description: 'Lightweight running shoes with responsive foam midsole.',
    category: 'Sports',
    brand: 'Trail Runner',
    price: 89,
    salePrice: 69,
    costPrice: 40,
    stock: 0,
    lowStockThreshold: 6,
    weight: 540,
    variants: '39, 40, 41, 42, 43, 44',
    tags: 'running, shoes, mens',
    status: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-03-20T16:22:00.000Z',
  },
  {
    id: 'p_1005',
    image:
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=200&q=80',
    name: 'Ceramic Coffee Mug',
    sku: 'CM-088',
    description: 'Hand-glazed ceramic mug, 350ml capacity. Dishwasher safe.',
    category: 'Home & Living',
    brand: 'Hearth',
    price: 18,
    salePrice: null,
    costPrice: 6,
    stock: 120,
    lowStockThreshold: 20,
    weight: 340,
    variants: 'Ivory, Charcoal, Sage',
    tags: 'mug, coffee, ceramic',
    status: 'draft',
    hidden: true,
    featured: false,
    createdAt: '2026-04-02T08:30:00.000Z',
  },
]

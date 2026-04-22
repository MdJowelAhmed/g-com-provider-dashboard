export type MenuStatus = 'active' | 'draft' | 'archived'

export type DietaryType =
  | 'vegetarian'
  | 'vegan'
  | 'non_vegetarian'
  | 'halal'
  | 'kosher'

export type SpicyLevel = 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot'

export type MenuItem = {
  id: string
  image: string
  name: string
  code: string
  category: string
  shortDescription: string

  price: number
  salePrice: number | null

  portionSize: string

  dietary: DietaryType
  spicyLevel: SpicyLevel

  bestSeller: boolean
  isNew: boolean

  status: MenuStatus
  hidden: boolean
  createdAt: string
}

export const MENU_CATEGORIES = [
  'Appetizer',
  'Soup',
  'Salad',
  'Main Course',
  'Rice & Biryani',
  'Bread',
  'Side',
  'Dessert',
  'Beverage',
  'Combo',
  'Kids Menu',
]

export const MENU_STATUS_OPTIONS: { value: MenuStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export const DIETARY_OPTIONS: { value: DietaryType; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non_vegetarian', label: 'Non-vegetarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
]

export const SPICY_LEVEL_OPTIONS: { value: SpicyLevel; label: string }[] = [
  { value: 'none', label: 'Not spicy' },
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot' },
  { value: 'extra_hot', label: 'Extra hot' },
]

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm_4001',
    image:
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80',
    name: 'Paneer Tikka',
    code: 'APP-PT',
    category: 'Appetizer',
    shortDescription: 'Char-grilled cottage cheese marinated in yogurt and spices.',
    price: 9.5,
    salePrice: null,
    portionSize: '6 pieces',
    dietary: 'vegetarian',
    spicyLevel: 'medium',
    bestSeller: false,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'm_4002',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    name: 'Chicken Biryani',
    code: 'MAI-CB',
    category: 'Rice & Biryani',
    shortDescription: 'Slow-cooked basmati rice layered with marinated chicken.',
    price: 13.0,
    salePrice: 11.5,
    portionSize: 'Full plate',
    dietary: 'non_vegetarian',
    spicyLevel: 'medium',
    bestSeller: true,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:05:00.000Z',
  },
  {
    id: 'm_4003',
    image:
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80',
    name: 'Butter Naan',
    code: 'BRD-BN',
    category: 'Bread',
    shortDescription: 'Soft tandoor-baked flatbread brushed with butter.',
    price: 2.5,
    salePrice: null,
    portionSize: '1 piece',
    dietary: 'vegetarian',
    spicyLevel: 'none',
    bestSeller: true,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:08:00.000Z',
  },
  {
    id: 'm_4004',
    image:
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
    name: 'Mango Lassi',
    code: 'BEV-ML',
    category: 'Beverage',
    shortDescription: 'Chilled yogurt smoothie blended with Alphonso mango.',
    price: 4.25,
    salePrice: null,
    portionSize: '300 ml',
    dietary: 'vegetarian',
    spicyLevel: 'none',
    bestSeller: false,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:10:00.000Z',
  },
  {
    id: 'm_4005',
    image:
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=400&q=80',
    name: 'Caesar Salad',
    code: 'SLD-CS',
    category: 'Salad',
    shortDescription: 'Romaine, parmesan shavings, croutons, classic caesar dressing.',
    price: 8.0,
    salePrice: null,
    portionSize: 'Bowl',
    dietary: 'non_vegetarian',
    spicyLevel: 'none',
    bestSeller: false,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:12:00.000Z',
  },
  {
    id: 'm_4006',
    image:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
    name: 'Dal Makhani',
    code: 'MAI-DM',
    category: 'Main Course',
    shortDescription: 'Slow-simmered black lentils with butter and cream.',
    price: 10.5,
    salePrice: null,
    portionSize: 'Bowl',
    dietary: 'vegetarian',
    spicyLevel: 'mild',
    bestSeller: true,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:15:00.000Z',
  },
  {
    id: 'm_4007',
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    name: 'Gulab Jamun',
    code: 'DES-GJ',
    category: 'Dessert',
    shortDescription: 'Warm milk dumplings in cardamom-rose syrup.',
    price: 4.5,
    salePrice: null,
    portionSize: '2 pieces',
    dietary: 'vegetarian',
    spicyLevel: 'none',
    bestSeller: false,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:18:00.000Z',
  },
  {
    id: 'm_4008',
    image:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80',
    name: 'Margherita Pizza',
    code: 'MAI-PZ-MG',
    category: 'Main Course',
    shortDescription: 'Wood-fired pizza with tomato, mozzarella, and basil.',
    price: 12.0,
    salePrice: null,
    portionSize: '12 inch',
    dietary: 'vegetarian',
    spicyLevel: 'none',
    bestSeller: false,
    isNew: true,
    status: 'active',
    hidden: false,
    createdAt: '2026-04-02T16:00:00.000Z',
  },
  {
    id: 'm_4009',
    image: '',
    name: 'Fish Amritsari',
    code: 'APP-FA',
    category: 'Appetizer',
    shortDescription: 'Punjabi-style battered and fried sole fish.',
    price: 11.5,
    salePrice: null,
    portionSize: '4 pieces',
    dietary: 'non_vegetarian',
    spicyLevel: 'hot',
    bestSeller: false,
    isNew: false,
    status: 'active',
    hidden: false,
    createdAt: '2026-01-14T09:20:00.000Z',
  },
]

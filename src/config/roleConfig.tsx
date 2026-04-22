import type { ComponentType } from 'react'
import {
  Wrench,
  BedDouble,
  UtensilsCrossed,
  Store,
  CalendarDays,
  LayoutDashboard,
  ClipboardList,
  Users,
  ShoppingBag,
  Ticket,
  BookOpen,
  Package,
  Banknote,
  type LucideProps,
} from 'lucide-react'
import type { Role } from '../types/role'

type IconType = ComponentType<LucideProps>

export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'number' | 'select' | 'time'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  required?: boolean
  colSpan?: 1 | 2
}

export type NavItem = {
  path: string
  label: string
  icon: IconType
}

export type RoleMeta = {
  role: Role
  label: string
  tagline: string
  description: string
  icon: IconType
  registrationFields: FieldDef[]
  navItems: NavItem[]
}

const commonFields: FieldDef[] = [
  { key: 'businessName', label: 'Business name', type: 'text', required: true, placeholder: 'e.g. Grand Plaza' },
  { key: 'ownerName', label: 'Owner full name', type: 'text', required: true, placeholder: 'Your name' },
  { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+1 555 000 0000' },
  { key: 'address', label: 'Street address', type: 'text', required: true, placeholder: 'Street, city, country', colSpan: 2 },
]

const descriptionField: FieldDef = {
  key: 'description',
  label: 'Short description',
  type: 'textarea',
  placeholder: 'Tell customers about your business',
  colSpan: 2,
}

export const ROLE_META: Record<Role, RoleMeta> = {
  service: {
    role: 'service',
    label: 'Service Provider',
    tagline: 'Home services, repairs, cleaning & more',
    description: 'Offer on-demand or scheduled services to customers in your area.',
    icon: Wrench,
    registrationFields: [
      ...commonFields,
      { key: 'serviceType', label: 'Primary service', type: 'select', required: true, options: ['Cleaning', 'Plumbing', 'Electrical', 'Beauty', 'Handyman', 'Other'] },
      { key: 'serviceArea', label: 'Service area (city/region)', type: 'text', required: true, placeholder: 'e.g. Downtown, 10km radius' },
      { key: 'teamSize', label: 'Team size', type: 'number', placeholder: '1' },
      descriptionField,
    ],
    navItems: [
      { path: '', label: 'Overview', icon: LayoutDashboard },
      { path: 'services', label: 'Services', icon: Wrench },
      { path: 'bookings', label: 'Bookings', icon: ClipboardList },
      { path: 'customers', label: 'Customers', icon: Users },
      { path: 'withdraw', label: 'Withdraw', icon: Banknote },
    ],
  },
  stay: {
    role: 'stay',
    label: 'Stay (Hotel)',
    tagline: 'Hotels, motels, villas & short stays',
    description: 'List rooms, manage reservations, and accept bookings.',
    icon: BedDouble,
    registrationFields: [
      ...commonFields,
      { key: 'propertyType', label: 'Property type', type: 'select', required: true, options: ['Hotel', 'Motel', 'Villa', 'Hostel', 'Resort', 'Apartment'] },
      { key: 'totalRooms', label: 'Total rooms', type: 'number', required: true, placeholder: '10' },
      { key: 'starRating', label: 'Star rating', type: 'select', options: ['Unrated', '1', '2', '3', '4', '5'] },
      { key: 'checkinTime', label: 'Latest check-in time', type: 'time', required: true },
      { key: 'checkoutTime', label: 'Latest check-out time', type: 'time', required: true },
      descriptionField,
    ],
    navItems: [
      { path: '', label: 'Overview', icon: LayoutDashboard },
      { path: 'rooms', label: 'Rooms', icon: BedDouble },
      { path: 'bookings', label: 'Bookings', icon: CalendarDays },
      { path: 'guests', label: 'Guests', icon: Users },
      { path: 'withdraw', label: 'Withdraw', icon: Banknote },
    ],
  },
  dine: {
    role: 'dine',
    label: 'Dine (Restaurant)',
    tagline: 'Restaurants, cafes & cloud kitchens',
    description: 'Manage menus, accept orders, and handle reservations.',
    icon: UtensilsCrossed,
    registrationFields: [
      ...commonFields,
      { key: 'cuisineType', label: 'Cuisine', type: 'select', required: true, options: ['Italian', 'Indian', 'Chinese', 'Mexican', 'American', 'Bengali', 'Multi-cuisine', 'Other'] },
      { key: 'seatingCapacity', label: 'Seating capacity', type: 'number', placeholder: '30' },
      { key: 'diningType', label: 'Dining type', type: 'select', required: true, options: ['Dine-in', 'Takeout', 'Delivery', 'All'] },
      descriptionField,
    ],
    navItems: [
      { path: '', label: 'Overview', icon: LayoutDashboard },
      { path: 'menu', label: 'Menu', icon: BookOpen },
      { path: 'orders', label: 'Orders', icon: ClipboardList },
      { path: 'withdraw', label: 'Withdraw', icon: Banknote },
    ],
  },
  shops: {
    role: 'shops',
    label: 'Shops (E-commerce)',
    tagline: 'Retail stores & online shops',
    description: 'List products, manage inventory, and fulfil orders.',
    icon: Store,
    registrationFields: [
      ...commonFields,
      { key: 'shopCategory', label: 'Category', type: 'select', required: true, options: ['Fashion', 'Electronics', 'Grocery', 'Beauty', 'Home & Living', 'Books', 'Other'] },
      { key: 'shopType', label: 'Shop type', type: 'select', required: true, options: ['Physical store', 'Online only', 'Both'] },
      { key: 'productCount', label: 'Approx. product count', type: 'number', placeholder: '50' },
      descriptionField,
    ],
    navItems: [
      { path: '', label: 'Overview', icon: LayoutDashboard },
      { path: 'products', label: 'Products', icon: Package },
      { path: 'orders', label: 'Orders', icon: ShoppingBag },
      { path: 'customers', label: 'Customers', icon: Users },
      { path: 'withdraw', label: 'Withdraw', icon: Banknote },
    ],
  },
  events: {
    role: 'events',
    label: 'Events',
    tagline: 'Concerts, workshops, meetups & more',
    description: 'Create events, sell tickets, and manage attendees.',
    icon: CalendarDays,
    registrationFields: [
      ...commonFields,
      { key: 'organizationType', label: 'Organization type', type: 'select', required: true, options: ['Individual organizer', 'Event company', 'Venue', 'Non-profit'] },
      { key: 'eventCategory', label: 'Main event category', type: 'select', required: true, options: ['Music', 'Sports', 'Business', 'Workshops', 'Food & Drink', 'Festivals', 'Other'] },
      { key: 'yearsHosting', label: 'Years hosting events', type: 'number', placeholder: '2' },
      descriptionField,
    ],
    navItems: [
      { path: '', label: 'Overview', icon: LayoutDashboard },
      { path: 'events', label: 'Events', icon: CalendarDays },
      { path: 'tickets', label: 'Tickets', icon: Ticket },
      { path: 'attendees', label: 'Attendees', icon: Users },
      { path: 'withdraw', label: 'Withdraw', icon: Banknote },
    ],
  },
}

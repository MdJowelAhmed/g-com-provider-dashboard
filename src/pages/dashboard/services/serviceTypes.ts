export type ServiceStatus = 'active' | 'draft' | 'archived'

export type PricingType = 'fixed' | 'hourly' | 'starting_from' | 'quote'

export type LocationType = 'on_site' | 'at_provider' | 'remote'

export type Service = {
  id: string
  image: string
  name: string
  code: string
  category: string
  shortDescription: string
  description: string

  pricingType: PricingType
  price: number
  salePrice?: number | null

  durationMinutes: number
  bufferMinutes: number

  serviceArea: string
  locationType: LocationType
  staffRequired: number
  warrantyDays?: number | null

  advanceBookingHours: number
  maxBookingsPerDay?: number | null
  cancellationPolicy: string

  includes: string
  excludes: string
  addons: string
  tags: string

  status: ServiceStatus
  featured: boolean
  hidden: boolean
  createdAt: string
}

export const SERVICE_CATEGORIES = [
  'Cleaning',
  'Plumbing',
  'Electrical',
  'Beauty',
  'Handyman',
  'HVAC',
  'Gardening',
  'Moving',
  'Appliance Repair',
  'Pest Control',
  'Other',
]

export const SERVICE_STATUS_OPTIONS: { value: ServiceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export const PRICING_TYPE_OPTIONS: { value: PricingType; label: string }[] = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Per hour' },
  { value: 'starting_from', label: 'Starting from' },
  { value: 'quote', label: 'Request a quote' },
]

export const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
  { value: 'on_site', label: "At customer's location" },
  { value: 'at_provider', label: 'At our location' },
  { value: 'remote', label: 'Remote / online' },
]

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's_1001',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80',
    name: 'Deep home cleaning',
    code: 'CLN-DEEP',
    category: 'Cleaning',
    shortDescription: 'Top-to-bottom cleaning for apartments and homes.',
    description:
      'Thorough cleaning of kitchens, bathrooms, bedrooms and living areas. Includes appliance exteriors, baseboards and windows.',
    pricingType: 'fixed',
    price: 120,
    salePrice: null,
    durationMinutes: 180,
    bufferMinutes: 30,
    serviceArea: 'Downtown, 10km radius',
    locationType: 'on_site',
    staffRequired: 2,
    warrantyDays: 3,
    advanceBookingHours: 12,
    maxBookingsPerDay: 4,
    cancellationPolicy: 'Free cancellation up to 6 hours before the appointment.',
    includes: 'Vacuuming, Mopping, Bathroom scrub, Kitchen degrease',
    excludes: 'Laundry, Dishwashing',
    addons: 'Window cleaning, Fridge interior, Oven interior',
    tags: 'cleaning, deep, home',
    status: 'active',
    featured: true,
    hidden: false,
    createdAt: '2026-03-04T09:10:00.000Z',
  },
  {
    id: 's_1002',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80',
    name: 'AC servicing & gas refill',
    code: 'AC-SVC',
    category: 'HVAC',
    shortDescription: 'Full AC check, coil clean and gas top-up.',
    description:
      'Technician inspects compressor, cleans condenser and evaporator coils, checks pressure and refills refrigerant if needed.',
    pricingType: 'starting_from',
    price: 75,
    salePrice: 59,
    durationMinutes: 60,
    bufferMinutes: 15,
    serviceArea: 'All city zones',
    locationType: 'on_site',
    staffRequired: 1,
    warrantyDays: 30,
    advanceBookingHours: 4,
    maxBookingsPerDay: 8,
    cancellationPolicy: 'Free cancellation up to 2 hours before the appointment.',
    includes: 'Inspection, Coil cleaning, Pressure check',
    excludes: 'Compressor replacement, Spare parts',
    addons: 'Gas refill (R32), Deep coil wash',
    tags: 'ac, hvac, maintenance',
    status: 'active',
    featured: false,
    hidden: false,
    createdAt: '2026-02-18T14:40:00.000Z',
  },
]

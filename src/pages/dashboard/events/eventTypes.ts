export type EventPublishStatus = 'draft' | 'active' | 'archived'

export type EventLifecycleStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'

export type EventType = 'in_person' | 'online' | 'hybrid'

export type AgeRestriction =
  | 'all_ages'
  | 'thirteen_plus'
  | 'sixteen_plus'
  | 'eighteen_plus'
  | 'twentyone_plus'

export type EventVenue = {
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
}

export type EventOnline = {
  platform: string
  joinUrl: string
}

export type Event = {
  id: string
  image: string
  name: string
  code: string
  category: string
  eventType: EventType
  shortDescription: string
  description: string
  tags: string

  startAt: string
  endAt: string
  timezone: string
  registrationDeadline: string

  venueName: string
  venueAddress: string
  venueCity: string
  venueLatitude: number | null
  venueLongitude: number | null

  onlinePlatform: string
  onlineJoinUrl: string

  minCapacity: number
  maxCapacity: number
  bookedCount: number

  pricingType: 'free' | 'paid'
  price: number
  earlyBirdPrice: number | null
  earlyBirdUntil: string

  refundPolicy: string
  ageRestriction: AgeRestriction

  status: EventLifecycleStatus
  publishStatus: EventPublishStatus
  hidden: boolean
  featured: boolean
  createdAt: string
}

export const EVENT_CATEGORIES = [
  'Music',
  'Sports',
  'Business',
  'Workshops',
  'Food & Drink',
  'Festivals',
  'Arts & Theatre',
  'Film',
  'Community',
  'Other',
]

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'in_person', label: 'In-person' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const EVENT_LIFECYCLE_STATUS_OPTIONS: {
  value: EventLifecycleStatus
  label: string
}[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
]

export const EVENT_PUBLISH_STATUS_OPTIONS: {
  value: EventPublishStatus
  label: string
}[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

export const AGE_RESTRICTION_OPTIONS: { value: AgeRestriction; label: string }[] = [
  { value: 'all_ages', label: 'All ages' },
  { value: 'thirteen_plus', label: '13+' },
  { value: 'sixteen_plus', label: '16+' },
  { value: 'eighteen_plus', label: '18+' },
  { value: 'twentyone_plus', label: '21+' },
]

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e_6001',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    name: 'Jazz Night Live',
    code: 'EVT-JNL-001',
    category: 'Music',
    eventType: 'in_person',
    shortDescription: 'An intimate evening of live jazz featuring three headline acts.',
    description:
      'Three curated jazz acts in a candlelit lounge. Dinner service from 18:30, first set at 20:00. Premium seating includes a welcome drink.',
    tags: 'jazz, live-music, night',
    startAt: '2026-05-15T19:30:00.000Z',
    endAt: '2026-05-15T23:30:00.000Z',
    timezone: 'America/New_York',
    registrationDeadline: '2026-05-15T17:00:00.000Z',
    venueName: 'Blue Harbor Lounge',
    venueAddress: '250 W 44th St',
    venueCity: 'New York, NY',
    venueLatitude: 40.758,
    venueLongitude: -73.987,
    onlinePlatform: '',
    onlineJoinUrl: '',
    minCapacity: 40,
    maxCapacity: 120,
    bookedCount: 88,
    pricingType: 'paid',
    price: 45,
    earlyBirdPrice: 35,
    earlyBirdUntil: '2026-05-05T23:59:00.000Z',
    refundPolicy: 'Full refund up to 48 hours before event. No refunds within 48 hours.',
    ageRestriction: 'eighteen_plus',
    status: 'scheduled',
    publishStatus: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-03-12T10:22:00.000Z',
  },
  {
    id: 'e_6002',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80',
    name: 'React Next — Advanced Patterns',
    code: 'EVT-RN-002',
    category: 'Workshops',
    eventType: 'online',
    shortDescription: 'Half-day online workshop on advanced React 19 patterns.',
    description:
      'Hands-on workshop covering suspense, server components, optimistic updates, and compiler-aware state. Recordings provided for 30 days.',
    tags: 'react, workshop, remote',
    startAt: '2026-05-20T14:00:00.000Z',
    endAt: '2026-05-20T18:00:00.000Z',
    timezone: 'UTC',
    registrationDeadline: '2026-05-19T23:00:00.000Z',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueLatitude: null,
    venueLongitude: null,
    onlinePlatform: 'Zoom',
    onlineJoinUrl: 'Sent to registrants 1 hour before the event.',
    minCapacity: 15,
    maxCapacity: 60,
    bookedCount: 42,
    pricingType: 'paid',
    price: 99,
    earlyBirdPrice: 79,
    earlyBirdUntil: '2026-05-05T23:59:00.000Z',
    refundPolicy: 'Refundable until 24 hours before start. Transferable anytime.',
    ageRestriction: 'all_ages',
    status: 'scheduled',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-03-01T08:10:00.000Z',
  },
  {
    id: 'e_6003',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    name: 'City Food Festival 2026',
    code: 'EVT-CFF-003',
    category: 'Food & Drink',
    eventType: 'hybrid',
    shortDescription: 'A full-day festival with 40+ vendors, live cooking demos, and chef talks.',
    description:
      'Taste-around passes include samples from 40 local restaurants plus a live-stream of the main chef stage for remote attendees.',
    tags: 'food, festival, family-friendly',
    startAt: '2026-06-05T11:00:00.000Z',
    endAt: '2026-06-05T21:00:00.000Z',
    timezone: 'America/New_York',
    registrationDeadline: '2026-06-04T23:00:00.000Z',
    venueName: 'Pier 17 Rooftop',
    venueAddress: '89 South St',
    venueCity: 'New York, NY',
    venueLatitude: 40.706,
    venueLongitude: -74.003,
    onlinePlatform: 'YouTube Live',
    onlineJoinUrl: 'Stream link emailed to virtual-pass holders on the day.',
    minCapacity: 200,
    maxCapacity: 1500,
    bookedCount: 742,
    pricingType: 'free',
    price: 0,
    earlyBirdPrice: null,
    earlyBirdUntil: '',
    refundPolicy: 'Free tickets are non-refundable but transferable.',
    ageRestriction: 'all_ages',
    status: 'scheduled',
    publishStatus: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-02-18T14:00:00.000Z',
  },
  {
    id: 'e_6004',
    image:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=400&q=80',
    name: 'Riverside City Marathon',
    code: 'EVT-RCM-004',
    category: 'Sports',
    eventType: 'in_person',
    shortDescription: '10K, half, and full marathon along the river waterfront.',
    description:
      'Three race tracks with chip-timed results, medals at finish, and post-race brunch included.',
    tags: 'sports, marathon, running',
    startAt: '2026-05-28T06:30:00.000Z',
    endAt: '2026-05-28T12:30:00.000Z',
    timezone: 'America/New_York',
    registrationDeadline: '2026-05-25T23:00:00.000Z',
    venueName: 'Riverside Park — 72nd St entrance',
    venueAddress: 'Riverside Dr & W 72nd St',
    venueCity: 'New York, NY',
    venueLatitude: 40.7799,
    venueLongitude: -73.9867,
    onlinePlatform: '',
    onlineJoinUrl: '',
    minCapacity: 200,
    maxCapacity: 2000,
    bookedCount: 1340,
    pricingType: 'paid',
    price: 35,
    earlyBirdPrice: 25,
    earlyBirdUntil: '2026-04-30T23:59:00.000Z',
    refundPolicy: 'Non-refundable. Deferrable to the next edition with a medical note.',
    ageRestriction: 'sixteen_plus',
    status: 'scheduled',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-03-20T09:00:00.000Z',
  },
  {
    id: 'e_6005',
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80',
    name: 'Startup Pitch Night',
    code: 'EVT-SPN-005',
    category: 'Business',
    eventType: 'in_person',
    shortDescription: 'Ten early-stage founders pitch to a panel of investors.',
    description:
      'Networking drinks from 18:00, pitches begin at 19:00, panel Q&A, and a chance to connect with investors afterward.',
    tags: 'startup, pitch, networking',
    startAt: '2026-05-10T18:00:00.000Z',
    endAt: '2026-05-10T22:00:00.000Z',
    timezone: 'America/New_York',
    registrationDeadline: '2026-05-10T14:00:00.000Z',
    venueName: 'Catalyst Loft',
    venueAddress: '145 W 27th St, 8th Floor',
    venueCity: 'New York, NY',
    venueLatitude: 40.7462,
    venueLongitude: -73.993,
    onlinePlatform: '',
    onlineJoinUrl: '',
    minCapacity: 30,
    maxCapacity: 150,
    bookedCount: 28,
    pricingType: 'paid',
    price: 25,
    earlyBirdPrice: null,
    earlyBirdUntil: '',
    refundPolicy: 'Full refund up to 24 hours before.',
    ageRestriction: 'eighteen_plus',
    status: 'scheduled',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-04-05T16:30:00.000Z',
  },
  {
    id: 'e_6006',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
    name: 'Indie Film Premiere — "Northlight"',
    code: 'EVT-IFP-006',
    category: 'Film',
    eventType: 'in_person',
    shortDescription: 'Premiere screening followed by a director Q&A.',
    description:
      'First public screening of the award-winning indie feature, followed by a 30-minute Q&A with director Maya Lin.',
    tags: 'film, premiere, indie',
    startAt: '2026-04-20T19:00:00.000Z',
    endAt: '2026-04-20T22:00:00.000Z',
    timezone: 'America/New_York',
    registrationDeadline: '2026-04-20T17:00:00.000Z',
    venueName: 'Arthouse Cinema',
    venueAddress: '212 E 12th St',
    venueCity: 'New York, NY',
    venueLatitude: 40.7322,
    venueLongitude: -73.988,
    onlinePlatform: '',
    onlineJoinUrl: '',
    minCapacity: 40,
    maxCapacity: 180,
    bookedCount: 172,
    pricingType: 'paid',
    price: 15,
    earlyBirdPrice: null,
    earlyBirdUntil: '',
    refundPolicy: 'Non-refundable.',
    ageRestriction: 'all_ages',
    status: 'completed',
    publishStatus: 'archived',
    hidden: false,
    featured: false,
    createdAt: '2026-03-02T12:00:00.000Z',
  },
]

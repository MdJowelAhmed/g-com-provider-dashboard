import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import {
  DollarSign,
  ClipboardList,
  Users,
  Star,
  BedDouble,
  CalendarDays,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Ticket,
  Wrench,
} from 'lucide-react'
import type { Role } from '../types/role'

type IconType = ComponentType<LucideProps>

export type Stat = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: IconType
}

export type TableData = {
  title: string
  description: string
  columns: { key: string; label: string; align?: 'left' | 'right' }[]
  rows: Record<string, string>[]
}

type RoleMock = {
  stats: Stat[]
  tables: Record<string, TableData>
}

export const ROLE_MOCK: Record<Role, RoleMock> = {
  service: {
    stats: [
      { label: 'Revenue (30d)', value: '$4,820', delta: '+12.4%', trend: 'up', icon: DollarSign },
      { label: 'Active bookings', value: '28', delta: '+5', trend: 'up', icon: ClipboardList },
      { label: 'Customers', value: '142', delta: '+8.2%', trend: 'up', icon: Users },
      { label: 'Avg. rating', value: '4.7', delta: '+0.1', trend: 'up', icon: Star },
    ],
    tables: {
      services: {
        title: 'Services',
        description: 'Services you offer to customers.',
        columns: [
          { key: 'name', label: 'Service' },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Price', align: 'right' },
          { key: 'duration', label: 'Duration' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { name: 'Deep home cleaning', category: 'Cleaning', price: '$120', duration: '3h', status: 'Active' },
          { name: 'AC servicing', category: 'Electrical', price: '$75', duration: '1h', status: 'Active' },
          { name: 'Plumbing repair', category: 'Plumbing', price: '$60', duration: '1.5h', status: 'Active' },
          { name: 'Bridal makeup', category: 'Beauty', price: '$250', duration: '2h', status: 'Draft' },
        ],
      },
      bookings: {
        title: 'Bookings',
        description: 'Upcoming and recent service bookings.',
        columns: [
          { key: 'id', label: 'Booking' },
          { key: 'customer', label: 'Customer' },
          { key: 'service', label: 'Service' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status' },
          { key: 'amount', label: 'Amount', align: 'right' },
        ],
        rows: [
          { id: '#BK-1042', customer: 'Ayesha Rahman', service: 'Deep home cleaning', date: 'Apr 22, 10:00', status: 'Confirmed', amount: '$120' },
          { id: '#BK-1041', customer: 'Tanvir Hasan', service: 'AC servicing', date: 'Apr 21, 14:30', status: 'In progress', amount: '$75' },
          { id: '#BK-1039', customer: 'Nusrat Jahan', service: 'Plumbing repair', date: 'Apr 20, 11:00', status: 'Completed', amount: '$60' },
          { id: '#BK-1037', customer: 'Rafi Ahmed', service: 'Deep home cleaning', date: 'Apr 19, 09:00', status: 'Completed', amount: '$120' },
        ],
      },
      customers: {
        title: 'Customers',
        description: 'People who booked your services.',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'bookings', label: 'Bookings', align: 'right' },
          { key: 'spend', label: 'Lifetime spend', align: 'right' },
        ],
        rows: [
          { name: 'Ayesha Rahman', email: 'ayesha@example.com', bookings: '6', spend: '$720' },
          { name: 'Tanvir Hasan', email: 'tanvir@example.com', bookings: '4', spend: '$300' },
          { name: 'Nusrat Jahan', email: 'nusrat@example.com', bookings: '3', spend: '$180' },
        ],
      },
    },
  },

  stay: {
    stats: [
      { label: 'Revenue (30d)', value: '$18,450', delta: '+9.1%', trend: 'up', icon: DollarSign },
      { label: 'Occupancy', value: '78%', delta: '+4%', trend: 'up', icon: BedDouble },
      { label: 'Bookings', value: '64', delta: '+12', trend: 'up', icon: CalendarDays },
      { label: 'Avg. rating', value: '4.6', delta: '-0.1', trend: 'down', icon: Star },
    ],
    tables: {
      rooms: {
        title: 'Rooms',
        description: 'Room inventory and availability.',
        columns: [
          { key: 'room', label: 'Room' },
          { key: 'type', label: 'Type' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'price', label: 'Price / night', align: 'right' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { room: '101', type: 'Deluxe King', capacity: '2', price: '$180', status: 'Occupied' },
          { room: '102', type: 'Deluxe King', capacity: '2', price: '$180', status: 'Available' },
          { room: '201', type: 'Family Suite', capacity: '4', price: '$320', status: 'Occupied' },
          { room: '202', type: 'Twin', capacity: '2', price: '$140', status: 'Cleaning' },
          { room: '301', type: 'Presidential', capacity: '4', price: '$620', status: 'Available' },
        ],
      },
      bookings: {
        title: 'Bookings',
        description: 'Upcoming and in-house reservations.',
        columns: [
          { key: 'id', label: 'Booking' },
          { key: 'guest', label: 'Guest' },
          { key: 'room', label: 'Room' },
          { key: 'checkin', label: 'Check-in' },
          { key: 'nights', label: 'Nights', align: 'right' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { id: '#RS-2241', guest: 'Michael Chen', room: '101 Deluxe', checkin: 'Apr 21', nights: '3', status: 'In-house' },
          { id: '#RS-2240', guest: 'Priya Sharma', room: '201 Suite', checkin: 'Apr 22', nights: '2', status: 'Confirmed' },
          { id: '#RS-2239', guest: 'David Wilson', room: '301 Presidential', checkin: 'Apr 25', nights: '5', status: 'Confirmed' },
          { id: '#RS-2235', guest: 'Sara Ahmed', room: '102 Deluxe', checkin: 'Apr 18', nights: '2', status: 'Checked out' },
        ],
      },
      guests: {
        title: 'Guests',
        description: 'Guest directory and history.',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'stays', label: 'Stays', align: 'right' },
          { key: 'lastVisit', label: 'Last visit' },
        ],
        rows: [
          { name: 'Michael Chen', email: 'michael@example.com', stays: '4', lastVisit: 'Apr 21, 2026' },
          { name: 'Priya Sharma', email: 'priya@example.com', stays: '2', lastVisit: 'Mar 30, 2026' },
          { name: 'David Wilson', email: 'dwilson@example.com', stays: '1', lastVisit: 'Feb 14, 2026' },
        ],
      },
    },
  },

  dine: {
    stats: [
      { label: 'Revenue (30d)', value: '$12,340', delta: '+6.8%', trend: 'up', icon: DollarSign },
      { label: 'Orders', value: '482', delta: '+54', trend: 'up', icon: ShoppingBag },
      { label: 'Avg. ticket', value: '$25.60', delta: '-$1.20', trend: 'down', icon: UtensilsCrossed },
      { label: 'Avg. rating', value: '4.5', delta: '+0.2', trend: 'up', icon: Star },
    ],
    tables: {
      menu: {
        title: 'Menu',
        description: 'Dishes available on your menu.',
        columns: [
          { key: 'dish', label: 'Dish' },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Price', align: 'right' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { dish: 'Margherita Pizza', category: 'Pizza', price: '$14', status: 'Available' },
          { dish: 'Chicken Biryani', category: 'Mains', price: '$12', status: 'Available' },
          { dish: 'Caesar Salad', category: 'Salads', price: '$9', status: 'Available' },
          { dish: 'Chocolate Lava Cake', category: 'Desserts', price: '$7', status: 'Out of stock' },
        ],
      },
      orders: {
        title: 'Orders',
        description: 'Recent kitchen and delivery orders.',
        columns: [
          { key: 'id', label: 'Order' },
          { key: 'customer', label: 'Customer' },
          { key: 'items', label: 'Items' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status' },
          { key: 'total', label: 'Total', align: 'right' },
        ],
        rows: [
          { id: '#OD-8821', customer: 'Walk-in T4', items: '3', type: 'Dine-in', status: 'Preparing', total: '$42' },
          { id: '#OD-8820', customer: 'Nadir H.', items: '2', type: 'Delivery', status: 'Out for delivery', total: '$28' },
          { id: '#OD-8819', customer: 'Walk-in T2', items: '5', type: 'Dine-in', status: 'Served', total: '$67' },
          { id: '#OD-8818', customer: 'Aisha K.', items: '1', type: 'Takeout', status: 'Ready', total: '$12' },
        ],
      },
    },
  },

  shops: {
    stats: [
      { label: 'Revenue (30d)', value: '$9,720', delta: '+14.2%', trend: 'up', icon: DollarSign },
      { label: 'Orders', value: '214', delta: '+32', trend: 'up', icon: ShoppingBag },
      { label: 'Products', value: '86', delta: '+4', trend: 'up', icon: Package },
      { label: 'Conversion', value: '3.4%', delta: '-0.2%', trend: 'down', icon: Users },
    ],
    tables: {
      products: {
        title: 'Products',
        description: 'Products listed in your shop.',
        columns: [
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'SKU' },
          { key: 'stock', label: 'Stock', align: 'right' },
          { key: 'price', label: 'Price', align: 'right' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { name: 'Classic Denim Jacket', sku: 'DJ-001', stock: '24', price: '$65', status: 'Active' },
          { name: 'Wireless Headphones', sku: 'WH-210', stock: '8', price: '$120', status: 'Low stock' },
          { name: 'Leather Wallet', sku: 'LW-045', stock: '40', price: '$35', status: 'Active' },
          { name: 'Running Shoes', sku: 'RS-114', stock: '0', price: '$89', status: 'Out of stock' },
        ],
      },
      orders: {
        title: 'Orders',
        description: 'Customer purchases and fulfilment status.',
        columns: [
          { key: 'id', label: 'Order' },
          { key: 'customer', label: 'Customer' },
          { key: 'items', label: 'Items', align: 'right' },
          { key: 'total', label: 'Total', align: 'right' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { id: '#SH-5501', customer: 'Jahid Islam', items: '3', total: '$215', status: 'Shipped' },
          { id: '#SH-5500', customer: 'Fariha Akter', items: '1', total: '$65', status: 'Processing' },
          { id: '#SH-5499', customer: 'Rayhan Khan', items: '2', total: '$155', status: 'Delivered' },
          { id: '#SH-5498', customer: 'Mim Rahman', items: '4', total: '$140', status: 'Delivered' },
        ],
      },
      customers: {
        title: 'Customers',
        description: 'Shoppers who bought from you.',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'orders', label: 'Orders', align: 'right' },
          { key: 'spend', label: 'Spend', align: 'right' },
        ],
        rows: [
          { name: 'Jahid Islam', email: 'jahid@example.com', orders: '12', spend: '$1,820' },
          { name: 'Fariha Akter', email: 'fariha@example.com', orders: '5', spend: '$420' },
          { name: 'Rayhan Khan', email: 'rayhan@example.com', orders: '3', spend: '$290' },
        ],
      },
    },
  },

  events: {
    stats: [
      { label: 'Revenue (30d)', value: '$22,180', delta: '+18.6%', trend: 'up', icon: DollarSign },
      { label: 'Active events', value: '6', delta: '+2', trend: 'up', icon: CalendarDays },
      { label: 'Tickets sold', value: '1,284', delta: '+240', trend: 'up', icon: Ticket },
      { label: 'Attendees', value: '972', delta: '+8.5%', trend: 'up', icon: Users },
    ],
    tables: {
      events: {
        title: 'Events',
        description: 'Upcoming and past events you organize.',
        columns: [
          { key: 'name', label: 'Event' },
          { key: 'category', label: 'Category' },
          { key: 'date', label: 'Date' },
          { key: 'venue', label: 'Venue' },
          { key: 'status', label: 'Status' },
        ],
        rows: [
          { name: 'Summer Beats 2026', category: 'Music', date: 'May 10', venue: 'Arena Hall', status: 'On sale' },
          { name: 'Startup Pitch Night', category: 'Business', date: 'Apr 28', venue: 'Innovation Hub', status: 'On sale' },
          { name: 'Street Food Fest', category: 'Food & Drink', date: 'Apr 25', venue: 'Downtown Square', status: 'Sold out' },
          { name: 'React Workshop', category: 'Workshops', date: 'Apr 12', venue: 'Co-work Space', status: 'Completed' },
        ],
      },
      tickets: {
        title: 'Tickets',
        description: 'Tickets available per event.',
        columns: [
          { key: 'event', label: 'Event' },
          { key: 'tier', label: 'Tier' },
          { key: 'price', label: 'Price', align: 'right' },
          { key: 'sold', label: 'Sold', align: 'right' },
          { key: 'remaining', label: 'Remaining', align: 'right' },
        ],
        rows: [
          { event: 'Summer Beats 2026', tier: 'VIP', price: '$180', sold: '84', remaining: '16' },
          { event: 'Summer Beats 2026', tier: 'General', price: '$65', sold: '612', remaining: '388' },
          { event: 'Startup Pitch Night', tier: 'General', price: '$25', sold: '210', remaining: '90' },
          { event: 'Street Food Fest', tier: 'Entry', price: '$10', sold: '500', remaining: '0' },
        ],
      },
      attendees: {
        title: 'Attendees',
        description: 'People who purchased tickets.',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'event', label: 'Event' },
          { key: 'tickets', label: 'Tickets', align: 'right' },
        ],
        rows: [
          { name: 'Sadia Hossain', email: 'sadia@example.com', event: 'Summer Beats 2026', tickets: '2' },
          { name: 'Arif Rahman', email: 'arif@example.com', event: 'Startup Pitch Night', tickets: '1' },
          { name: 'Lina Chen', email: 'lina@example.com', event: 'Street Food Fest', tickets: '4' },
        ],
      },
    },
  },
}

export const DASHBOARD_ICON: Record<Role, IconType> = {
  service: Wrench,
  stay: BedDouble,
  dine: UtensilsCrossed,
  shops: ShoppingBag,
  events: CalendarDays,
}

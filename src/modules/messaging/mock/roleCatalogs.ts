import type { Role } from '../../../types/role'
import type { CatalogItem } from '../types'

/** Mock catalogs — replace with repository/API per role */
export function getCatalogForRole(role: Role): CatalogItem[] {
  switch (role) {
    case 'dine':
      return [
        { id: 'm1', label: 'Margherita Pizza', subtitle: '12"', unitPrice: 14, currency: 'GH₵' },
        { id: 'm2', label: 'Grilled Salmon', subtitle: 'Main', unitPrice: 22, currency: 'GH₵' },
        { id: 'm3', label: 'Caesar Salad', subtitle: 'Side', unitPrice: 9, currency: 'GH₵' },
      ]
    case 'events':
      return [
        { id: 'e1', label: 'VIP Ticket', subtitle: 'Summer Fest', unitPrice: 120, currency: 'GH₵' },
        { id: 'e2', label: 'General Admission', subtitle: 'Summer Fest', unitPrice: 45, currency: 'GH₵' },
        { id: 'e3', label: 'Workshop Pass', subtitle: 'Add-on', unitPrice: 35, currency: 'GH₵' },
      ]
    case 'services':
      return [
        { id: 's1', label: 'Deep clean (3 bed)', subtitle: 'Fixed', unitPrice: 180, currency: 'GH₵' },
        { id: 's2', label: 'AC maintenance', subtitle: 'Visit', unitPrice: 95, currency: 'GH₵' },
        { id: 's3', label: 'Emergency call-out', subtitle: 'Fee', unitPrice: 60, currency: 'GH₵' },
      ]
    case 'shops':
      return [
        { id: 'p1', label: 'Wireless earbuds', subtitle: 'SKU-E01', unitPrice: 79, currency: 'GH₵' },
        { id: 'p2', label: 'USB-C cable', subtitle: 'SKU-C42', unitPrice: 12, currency: 'GH₵' },
        { id: 'p3', label: 'Phone case', subtitle: 'SKU-P09', unitPrice: 24, currency: 'GH₵' },
      ]
    case 'stay':
      return [
        { id: 'r1', label: 'Deluxe King', subtitle: 'Room upgrade', unitPrice: 40, currency: 'GH₵' },
        { id: 'r2', label: 'Airport transfer', subtitle: 'One-way', unitPrice: 55, currency: 'GH₵' },
        { id: 'r3', label: 'Breakfast buffet', subtitle: 'Per guest', unitPrice: 18, currency: 'GH₵' },
      ]
    default:
      return []
  }
}

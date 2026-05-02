export type SettingsTabId =
  | 'personal'
  | 'business'
  | 'security'
  | 'media'
  | 'social'
  | 'documents'
  | 'notifications'
  | 'account'

export type NotificationPrefs = {
  orders: boolean
  payouts: boolean
  marketing: boolean
  securityAlerts: boolean
  productUpdates: boolean
}

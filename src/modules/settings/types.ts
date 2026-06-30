export type SettingsTabId =
  | 'personal'
  | 'business'
  | 'documents'
  | 'security'
  // | 'notifications'

export type NotificationPrefs = {
  orders: boolean
  payouts: boolean
  marketing: boolean
  securityAlerts: boolean
  productUpdates: boolean
}

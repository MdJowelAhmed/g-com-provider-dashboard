export type SettingsTabId =
  | 'personal'
  | 'business'
  | 'security'
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

import type { SettingsTabId } from './types'

export const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'business', label: 'Business' },
  { id: 'security', label: 'Security' },
  { id: 'media', label: 'Media' },
  { id: 'social', label: 'Social' },
  { id: 'documents', label: 'Documents' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'account', label: 'Account' },
]

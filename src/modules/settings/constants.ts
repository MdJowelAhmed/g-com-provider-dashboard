import type { SettingsTabId } from './types'

export const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'business', label: 'Business' },

  { id: 'documents', label: 'Documents' },
  { id: 'security', label: 'Security' },
]

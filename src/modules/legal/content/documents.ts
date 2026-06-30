import type { LegalDocumentMeta, LegalDocId } from '../types'

export const LEGAL_LAST_UPDATED = 'API'

const terms: LegalDocumentMeta = {
  id: 'terms',
  slug: 'terms',
  title: 'Terms & Conditions',
  shortTitle: 'Terms',
  description: 'Customer terms and conditions.',
  lastUpdated: LEGAL_LAST_UPDATED,
  version: 'API',
  sections: [],
}

const privacy: LegalDocumentMeta = {
  id: 'privacy',
  slug: 'privacy',
  title: 'Privacy Policy',
  shortTitle: 'Privacy',
  description: 'Customer privacy policy.',
  lastUpdated: LEGAL_LAST_UPDATED,
  version: 'API',
  sections: [],
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocumentMeta> = {
  terms,
  privacy,
}

export const LEGAL_DOC_ORDER: LegalDocId[] = ['terms', 'privacy']

export function getLegalDocument(slug: string): LegalDocumentMeta | undefined {
  const entry = Object.values(LEGAL_DOCUMENTS).find((d) => d.slug === slug)
  return entry
}

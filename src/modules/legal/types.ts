export type LegalDocId = 'terms' | 'privacy'

export type LegalHighlight = {
  title: string
  body: string
}

export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  highlights?: LegalHighlight[]
}

export type LegalDocumentMeta = {
  id: LegalDocId
  slug: string
  title: string
  shortTitle: string
  description: string
  lastUpdated: string
  version: string
  sections: LegalSection[]
}

/** Shared shapes for permission UI (controller modal, docs). */
export type PermissionDef = {
  id: string
  label: string
  description: string
}

export type PermissionGroup = {
  id: string
  label: string
  description?: string
  permissions: PermissionDef[]
}

/** Maps sidebar `path` (empty string = overview) → `nav.*` id */
export function navPathToPermissionId(path: string): string {
  const p = path.trim()
  if (p === '') return 'nav.overview'
  return `nav.${p.replace(/[^a-z0-9-]/gi, '_')}`
}

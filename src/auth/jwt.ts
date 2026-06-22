export type JwtAuthClaims = {
  id?: string
  role?: string
  email?: string
}

export function decodeJwtPayload(token: string): JwtAuthClaims | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Record<string, unknown>
    return {
      id: typeof payload.id === 'string' ? payload.id : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    }
  } catch {
    return null
  }
}

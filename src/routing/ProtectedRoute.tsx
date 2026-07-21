import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../auth/useAuth'
import {
  getDashboardPath,
  parseDashboardRoleParam,
  resolveRoleForMeta,
} from './roleRedirect'
import type { RootState } from '../redux/store'

/**
 * Requires authentication and ensures `/dashboard/:role` matches the signed-in user.
 */
export default function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  const authRole = useSelector((state: RootState) => state.auth.role)
  const token = useSelector((state: RootState) => state.auth.token)
  const { role: roleSegment } = useParams<{ role: string }>()

  const rawSessionRole = user?.role ?? authRole

  if (!token && !user) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  if (!rawSessionRole) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  // Normalize JWT roles like `provider` and URL/tenant roles like `services`
  // so a remap does not kick the user from `/settings` to overview.
  const sessionRole = resolveRoleForMeta(String(rawSessionRole))
  const urlRoleRaw = parseDashboardRoleParam(roleSegment)
  const urlRole = urlRoleRaw ? resolveRoleForMeta(urlRoleRaw) : null

  if (roleSegment && urlRoleRaw === null) {
    return <Navigate to={getDashboardPath(sessionRole)} replace />
  }

  if (urlRole !== null && urlRole !== sessionRole) {
    // Keep the current tab (e.g. /settings) when correcting the role segment.
    const suffix = roleSegment
      ? location.pathname.slice(`/dashboard/${roleSegment}`.length)
      : ''
    return (
      <Navigate
        to={`${getDashboardPath(sessionRole)}${suffix}${location.search}`}
        replace
      />
    )
  }

  return <Outlet />
}

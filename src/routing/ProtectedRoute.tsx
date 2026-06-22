import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../auth/useAuth'
import { getDashboardPath, parseDashboardRoleParam } from './roleRedirect'
import type { RootState } from '../redux/store'

/**
 * Requires authentication and ensures `/dashboard/:role` matches the signed-in user.
 */
export default function ProtectedRoute() {
  const { user } = useAuth()
  const authRole = useSelector((state: RootState) => state.auth.role)
  const token = useSelector((state: RootState) => state.auth.token)
  const { role: roleSegment } = useParams<{ role: string }>()

  const sessionRole = user?.role ?? authRole

  if (!token && !user) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  if (!sessionRole) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  const urlRole = parseDashboardRoleParam(roleSegment)

  if (roleSegment && urlRole === null) {
    return <Navigate to={getDashboardPath(sessionRole)} replace />
  }

  if (urlRole !== null && urlRole !== sessionRole) {
    return <Navigate to={getDashboardPath(sessionRole)} replace />
  }

  return <Outlet />
}

import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getDashboardPath, parseDashboardRoleParam } from './roleRedirect'

/**
 * Requires authentication and ensures `/dashboard/:role` matches the signed-in user.
 */
export default function ProtectedRoute() {
  const { user } = useAuth()
  const { role: roleSegment } = useParams<{ role: string }>()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  const urlRole = parseDashboardRoleParam(roleSegment)

  if (roleSegment && urlRole === null) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  if (urlRole !== null && urlRole !== user.role) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return <Outlet />
}

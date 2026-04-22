import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES, type Role } from '../types/role'

export default function ProtectedRoute() {
  const { user } = useAuth()
  const { role } = useParams<{ role: string }>()

  if (!user) return <Navigate to="/login" replace />

  if (role && !ROLES.includes(role as Role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  if (role && role !== user.role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  return <Outlet />
}

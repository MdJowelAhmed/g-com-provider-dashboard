import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useAuth } from '../context/AuthContext'
import { ROLE_META } from '../config/roleConfig'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const meta = ROLE_META[user.role]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page text-gray-100">
      <Sidebar meta={meta} onLogout={handleLogout} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

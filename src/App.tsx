import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import CheckEmail from './pages/auth/CheckEmail'
import SetNewPassword from './pages/auth/SetNewPassword'
import PasswordResetSuccess from './pages/auth/PasswordResetSuccess'
import DashboardLayout from './layouts/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import ListPage from './pages/dashboard/ListPage'
import ProtectedRoute from './routing/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/reset-password" element={<SetNewPassword />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

      <Route path="/dashboard/:role" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path=":tab" element={<ListPage />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function DashboardRedirect() {
  const raw = localStorage.getItem('gcom.currentUser')
  try {
    const user = raw ? JSON.parse(raw) : null
    if (user?.role) return <Navigate to={`/dashboard/${user.role}`} replace />
  } catch {
    // ignore
  }
  return <Navigate to="/login" replace />
}

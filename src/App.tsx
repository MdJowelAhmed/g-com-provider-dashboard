import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import SetNewPassword from './pages/auth/SetNewPassword'
import PasswordResetSuccess from './pages/auth/PasswordResetSuccess'
import DashboardLayout from './layouts/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import ListPage from './pages/dashboard/ListPage'
import LegalHubPage from './pages/dashboard/legal/LegalHubPage'
import LegalDocumentPage from './pages/dashboard/legal/LegalDocumentPage'
import ProtectedRoute from './routing/ProtectedRoute'
import { AUTH_STORAGE_KEYS } from './auth/session'
import { getDashboardPath, normalizeUserRole } from './routing/roleRedirect'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<SetNewPassword />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

      <Route path="/dashboard/:role" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="legal" element={<LegalHubPage />} />
          <Route path="legal/:docSlug" element={<LegalDocumentPage />} />
          <Route path=":tab" element={<ListPage />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function DashboardRedirect() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.currentUser)
    if (!raw) return <Navigate to="/login" replace />
    const parsed = JSON.parse(raw) as { role?: unknown }
    const role = normalizeUserRole(parsed.role)
    return <Navigate to={getDashboardPath(role)} replace />
  } catch {
    return <Navigate to="/login" replace />
  }
}

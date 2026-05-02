import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import FormSelect from '../../components/auth/FormSelect'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import { useAuth } from '../../context/AuthContext'
import { getDashboardPath } from '../../routing/roleRedirect'
import { ROLES, type Role } from '../../types/role'

const LAST_LOGIN_ROLE_KEY = 'gcom.lastLoginRole'

const LOGIN_ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'services', label: 'Service Provider' },
  { value: 'stay', label: 'Stay (Hotel)' },
  { value: 'dine', label: 'Dine (Restaurant)' },
  { value: 'shops', label: 'Shops (E-commerce)' },
  { value: 'events', label: 'Events' },
]

function readStoredRole(): Role | '' {
  try {
    const raw = localStorage.getItem(LAST_LOGIN_ROLE_KEY)
    if (raw && ROLES.includes(raw as Role)) return raw as Role
  } catch {
    /* ignore */
  }
  return ''
}

export default function Login() {
  const navigate = useNavigate()
  const { loginWithRole } = useAuth()
  const [accountType, setAccountType] = useState<Role | ''>(() => readStoredRole())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!accountType) {
      setError('Please select your account type to continue.')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 320))

    try {
      const user = loginWithRole(email.trim(), accountType)
      if (!user) {
        setError('No provider found with this email. Please register first.')
        return
      }

      try {
        localStorage.setItem(LAST_LOGIN_ROLE_KEY, accountType)
      } catch {
        /* ignore */
      }

      navigate(getDashboardPath(accountType), { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration src="/assets/login.png" alt="User login illustration" />}
    >
      <AuthCard description="Welcome back! Please enter your details.">
        <form onSubmit={onSubmit} className="space-y-5">
          <FormSelect
            label="Account Type"
            name="accountType"
            value={accountType}
            onChange={(e) => setAccountType((e.target.value as Role) || '')}
            optionItems={LOGIN_ROLE_OPTIONS}
            placeholderOption="Select account type"
            required={false}
            disabled={submitting}
            aria-required="true"
          />

          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />

          <div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              disabled={submitting}
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-accent-amber hover:underline"
              >
                Forgot password
              </Link>
            </div>
          </div>

          {error && <p className="text-xs text-accent-danger">{error}</p>}

          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>

          <p className="text-center text-xs text-gray-400">
            New provider?{' '}
            <Link to="/register" className="text-accent-amber hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

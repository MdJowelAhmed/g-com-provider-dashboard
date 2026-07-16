import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import { mapUserProfileToUser } from '../../auth/userProfile'
import { useAuth } from '../../context/AuthContext'
import { useLazyGetMyProfileQuery, useLoginMutation } from '../../redux/api/authApi'
import { getDashboardPath } from '../../routing/roleRedirect'

function getLoginErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) return message
    }
  }
  return 'Invalid email or password. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const { setUserFromProfile } = useAuth()
  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [fetchProfile, { isFetching: loadingProfile }] = useLazyGetMyProfileQuery()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isLoading = loggingIn || loadingProfile

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await login({
        email: email.trim(),
        password,
      }).unwrap()

      const profileResponse = await fetchProfile(undefined, false).unwrap()
      if (!profileResponse.success || !profileResponse.data) {
        setError('Signed in, but profile could not be loaded. Please try again.')
        return
      }

      const user = mapUserProfileToUser(profileResponse.data)
      setUserFromProfile(user)
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (err) {
      setError(getLoginErrorMessage(err))
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration src="/assets/login.png" alt="User login illustration" />}
    >
      <AuthCard description="Welcome back! Please enter your details.">
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              disabled={isLoading}
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

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
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

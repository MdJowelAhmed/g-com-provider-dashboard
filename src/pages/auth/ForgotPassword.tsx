import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useForgotPasswordMutation } from '../../redux/api/authApi'

function getAuthApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
    }
  }
  return fallback
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await forgotPassword({ email: email.trim() }).unwrap()
      navigate('/verify-email', { state: { email: email.trim(), purpose: 'forgot' } })
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Could not send reset instructions. Please try again.'))
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration src="/assets/forgot.png" alt="Forgot password illustration" />}
    >
      <AuthCard
        title="Forgot password?"
        description="No worries, we'll send you reset instructions."
      >
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

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Submit'}
          </PrimaryButton>
        </form>
        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}

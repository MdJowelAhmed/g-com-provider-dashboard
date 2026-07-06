import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useResetPasswordMutation } from '../../redux/api/authApi'

const MIN_LENGTH = 8

type LocationState = { email?: string } | null

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

export default function SetNewPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const email = (state?.email ?? '').trim()

  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
      return
    }

    const resetToken =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('resetPasswordToken')
        : null

    if (!resetToken) {
      navigate('/verify-email', { replace: true, state: { email, purpose: 'forgot' } })
    }
  }, [email, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setError(null)

    try {
      await resetPassword({
        email,
        newPassword: password,
        confirmPassword: confirm,
      }).unwrap()
      navigate('/password-reset-success', { replace: true })
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Could not reset password. Please try again.'))
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration src="/assets/reset.png" alt="Reset password illustration" />}
    >
      <AuthCard
        title="Set new password"
        description="Your new password must be different to previously used passwords."
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            hint={`Must be at least ${MIN_LENGTH} characters.`}
            disabled={isLoading}
          />
          <PasswordField
            label="Confirm password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            disabled={isLoading}
          />

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting…' : 'Reset password'}
          </PrimaryButton>
        </form>
        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}

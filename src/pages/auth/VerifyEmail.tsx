import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useResentOtpMutation, useVerifyEmailMutation } from '../../redux/api/authApi'

type Purpose = 'forgot' | 'register'
type LocationState =
  | {
      email?: string
      purpose?: Purpose
    }
  | null

const OTP_LENGTH = 6

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

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  const email = (state?.email ?? '').trim()
  const purpose: Purpose = state?.purpose ?? 'forgot'

  const [verifyEmail, { isLoading: verifying }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: resending }] = useResentOtpMutation()

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  )
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const otp = useMemo(() => digits.join(''), [digits])
  const isLoading = verifying || resending

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
      return
    }
    inputRefs.current[0]?.focus()
  }, [email, navigate])

  const setDigit = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      setDigit(index, '')
      return
    }

    const chars = value.slice(0, OTP_LENGTH - index).split('')
    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < chars.length; i++) {
        next[index + i] = chars[i]
      }
      return next
    })

    const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '')
        return
      }
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        setDigit(index - 1, '')
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus()
  }

  const handleResend = async () => {
    setError(null)
    try {
      await resendOtp({ email }).unwrap()
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Could not resend code. Please try again.'))
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Missing email. Please restart the flow.')
      return
    }
    if (otp.length !== OTP_LENGTH || digits.some((d) => !d)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`)
      return
    }

    setError(null)

    try {
      await verifyEmail({
        email,
        oneTimeCode: Number(otp),
        purpose: 'forgot',
      }).unwrap()

      if (purpose === 'forgot') {
        navigate('/reset-password', { state: { email } })
        return
      }

      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Invalid verification code. Please try again.'))
    }
  }

  const description = email
    ? `Enter the 6-digit code we sent to ${email}.`
    : 'Enter the 6-digit code we sent to your email.'

  return (
    <AuthLayout illustration={<AuthIllustration src="/assets/verify.png" alt="Verify email illustration" />}>
      <AuthCard title="Verify your email" description={description}>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  value={digits[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className="h-12 w-12 rounded-md bg-white text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-ring disabled:opacity-60"
                  maxLength={OTP_LENGTH}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                className="font-medium text-accent-amber hover:underline disabled:opacity-60"
                disabled={isLoading}
                onClick={handleResend}
              >
                {resending ? 'Sending…' : 'Resend'}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {verifying ? 'Verifying…' : 'Verify'}
          </PrimaryButton>
        </form>

        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}

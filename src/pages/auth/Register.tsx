import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import FormField from '../../components/auth/FormField'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BusinessOnboardingForm from '../../components/auth/BusinessOnboardingForm'
import {
  useBusinessRegisterMutation,
  useResentOtpMutation,
  useVerifyEmailMutation,
} from '../../redux/api/authApi'

const OTP_LENGTH = 6

function getAuthApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  )
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])

  const [businessRegister, { isLoading: registering }] = useBusinessRegisterMutation()
  const [verifyEmail, { isLoading: verifyingEmail }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: resendingOtp }] = useResentOtpMutation()

  const otp = useMemo(() => otpDigits.join(''), [otpDigits])
  const busy = registering || verifyingEmail || resendingOtp

  useEffect(() => {
    if (step === 2) {
      otpInputRefs.current[0]?.focus()
    }
  }, [step])

  const setOtpDigit = (index: number, value: string) => {
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleOtpChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      setOtpDigit(index, '')
      return
    }

    const chars = value.slice(0, OTP_LENGTH - index).split('')
    setOtpDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < chars.length; i++) {
        next[index + i] = chars[i]
      }
      return next
    })

    const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1)
    otpInputRefs.current[nextIndex]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        setOtpDigit(index, '')
        return
      }
      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus()
        setOtpDigit(index - 1, '')
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpInputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const submitAccount = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await businessRegister({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap()
      setStep(2)
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Registration failed. Please try again.'))
    }
  }

  const submitEmailVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length !== OTP_LENGTH || otpDigits.some((d) => !d)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`)
      return
    }

    try {
      await verifyEmail({
        email: email.trim(),
        oneTimeCode: Number(otp),
      }).unwrap()
      setStep(3)
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Invalid or expired verification code.'))
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    try {
      await resendOtp({ email: email.trim() }).unwrap()
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Could not resend code. Please try again.'))
    }
  }

  if (step === 1) {
    return (
      <AuthLayout>
        <AuthCard title="Create an account">
          <form onSubmit={submitAccount} className="space-y-4">
            <FormField
              label="Name*"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              required
              disabled={busy}
            />
            <FormField
              label="Email*"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={busy}
            />
            <PasswordField
              label="Password*"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              autoComplete="new-password"
              hint="Must be at least 8 characters."
              disabled={busy}
            />
            <PasswordField
              label="Confirm Password*"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Create a password"
              autoComplete="new-password"
              hint="Must be at least 8 characters."
              disabled={busy}
            />

            {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

            <PrimaryButton type="submit" disabled={busy}>
              {registering ? 'Creating account…' : 'Sign Up'}
            </PrimaryButton>

            <p className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (step === 2) {
    return (
      <AuthLayout>
        <AuthCard
          title="Verify your email"
          description={`Enter the 6-digit code we sent to ${email}.`}
        >
          <form onSubmit={submitEmailVerify} className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  value={otpDigits[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 rounded-md bg-white text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-ring"
                  maxLength={OTP_LENGTH}
                  disabled={busy}
                />
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                className="font-medium text-accent-amber hover:underline disabled:opacity-50"
                onClick={handleResendOtp}
                disabled={busy}
              >
                {resendingOtp ? 'Sending…' : 'Resend'}
              </button>
            </div>

            {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

            <PrimaryButton type="submit" disabled={busy}>
              {verifyingEmail ? 'Verifying…' : 'Verify email'}
            </PrimaryButton>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Business Information"
        description="Complete your business profile and select your category to continue."
        bordered
        maxWidthClass="max-w-4xl"
      >
        <BusinessOnboardingForm submitLabel="Complete registration" />
      </AuthCard>
    </AuthLayout>
  )
}

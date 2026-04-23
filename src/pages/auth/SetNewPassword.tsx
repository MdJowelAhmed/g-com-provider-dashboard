import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'

const MIN_LENGTH = 8

export default function SetNewPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
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
    navigate('/password-reset-success')
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
          />
          <PasswordField
            label="Confirm password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
          />

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <PrimaryButton type="submit">Reset password</PrimaryButton>
        </form>
        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}

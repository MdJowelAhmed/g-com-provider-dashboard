import { useLocation } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'

type LocationState = { email?: string } | null

export default function CheckEmail() {
  const location = useLocation()
  const state = location.state as LocationState
  const email = state?.email ?? 'your email'

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="Check email illustration" />}
    >
      <AuthCard
        title="Check your email"
        description={`We sent a password reset link to ${email}`}
      >
        <PrimaryButton type="button">Open email app</PrimaryButton>

        <p className="mt-5 text-center text-sm text-gray-400">
          Didn't receive the email?{' '}
          <button
            type="button"
            className="font-medium text-accent-amber hover:underline"
          >
            Click to resend
          </button>
        </p>

        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}

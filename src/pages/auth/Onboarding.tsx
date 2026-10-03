import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import BusinessOnboardingForm from '../../components/auth/BusinessOnboardingForm'
import { useAuth } from '../../context/AuthContext'
import { getDashboardPath, isOnboardingComplete } from '../../routing/roleRedirect'
import { useGetMyProfileQuery } from '../../redux/api/authApi'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profileResponse, isLoading: loadingProfile } = useGetMyProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const profile = profileResponse?.data
  const business = profile?.business

  // If already onboarded, redirect to dashboard
  useEffect(() => {
    if (user && isOnboardingComplete(user)) {
      navigate(getDashboardPath(user.role), { replace: true })
    }
  }, [user, navigate])

  if (loadingProfile && !profile) {
    return (
      <AuthLayout>
        <AuthCard title="Loading business onboarding…">
          <p className="text-center text-sm text-gray-400">Please wait…</p>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Business Onboarding"
        description="Complete your business profile and select your category to continue."
        bordered
        maxWidthClass="max-w-4xl"
      >
        <BusinessOnboardingForm
          initialValues={business}
          submitLabel="Complete onboarding"
        />
      </AuthCard>
    </AuthLayout>
  )
}

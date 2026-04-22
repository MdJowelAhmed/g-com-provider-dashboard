import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import FormSelect from '../../components/auth/FormSelect'
import FormTextarea from '../../components/auth/FormTextarea'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import CategoryCard from '../../components/auth/CategoryCard'
import StepIndicator from '../../components/auth/StepIndicator'
import { ROLES, type Role } from '../../types/role'
import { ROLE_META, type FieldDef } from '../../config/roleConfig'
import { useAuth } from '../../context/AuthContext'

const STEPS = ['Category', 'Details', 'Payment', 'Done']

const CORE_KEYS = new Set([
  'businessName',
  'ownerName',
  'phone',
  'address',
  'email',
  'password',
])

export default function Register() {
  const navigate = useNavigate()
  const { register, connectStripe, user } = useAuth()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const meta = role ? ROLE_META[role] : null
  const fields = meta?.registrationFields ?? []

  const setValue = (key: string, val: string) =>
    setValues((v) => ({ ...v, [key]: val }))

  const goNextFromCategory = () => {
    if (!role) {
      setError('Please pick a category to continue.')
      return
    }
    setError(null)
    setStep(2)
  }

  const submitDetails = (e: FormEvent) => {
    e.preventDefault()
    if (!role || !meta) return

    const missing = meta.registrationFields.find(
      (f) => f.required && !values[f.key]?.trim(),
    )
    if (missing) {
      setError(`Please fill the "${missing.label}" field.`)
      return
    }
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    const extra: Record<string, string> = {}
    for (const f of fields) {
      if (!CORE_KEYS.has(f.key)) extra[f.key] = values[f.key] ?? ''
    }

    register({
      role,
      email: email.trim(),
      businessName: values.businessName ?? '',
      ownerName: values.ownerName ?? '',
      phone: values.phone ?? '',
      address: values.address ?? '',
      extra,
    })
    setError(null)
    setStep(3)
  }

  const handleStripeConnect = () => {
    connectStripe()
    setStep(4)
  }

  const handleSkipStripe = () => setStep(4)

  const illustration = useMemo(
    () => <AuthIllustration alt="Provider registration illustration" />,
    [],
  )

  return (
    <AuthLayout illustration={illustration}>
      <AuthCard
        description={
          step === 1
            ? 'Create a provider account. Start by choosing what you offer.'
            : step === 2
              ? `Tell us about your ${ROLE_META[role!].label.toLowerCase()}.`
              : step === 3
                ? 'Connect Stripe so you can receive payouts.'
                : 'Your account is ready.'
        }
      >
        <StepIndicator current={step} steps={STEPS} />

        {step === 1 && (
          <div className="space-y-3">
            {ROLES.map((r) => {
              const m = ROLE_META[r]
              return (
                <CategoryCard
                  key={r}
                  label={m.label}
                  tagline={m.tagline}
                  icon={m.icon}
                  selected={role === r}
                  onClick={() => setRole(r)}
                />
              )
            })}
            {error && (
              <p className="text-xs text-accent-danger">{error}</p>
            )}
            <PrimaryButton type="button" onClick={goNextFromCategory}>
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </PrimaryButton>
            <div className="text-center text-xs text-gray-400">
              Already a provider?{' '}
              <Link to="/login" className="text-accent-amber hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {step === 2 && meta && (
          <form onSubmit={submitDetails} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldRenderer
                  key={f.key}
                  field={f}
                  value={values[f.key] ?? ''}
                  onChange={(v) => setValue(f.key, v)}
                />
              ))}
              <div className="sm:col-span-2">
                <FormField
                  label="Business email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <p className="text-xs text-accent-danger">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-11 flex-1 items-center justify-center gap-1 rounded-md border border-surface-border text-sm font-medium text-gray-200 hover:bg-surface-elevated"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <PrimaryButton type="submit" className="flex-[2]">
                Continue <ArrowRight size={16} className="ml-1 inline" />
              </PrimaryButton>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-surface-border bg-surface-elevated p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-white">Stripe Connect</div>
                  <p className="mt-1 text-gray-400">
                    We use Stripe for secure payments. You'll be redirected to
                    Stripe to verify your identity and bank details.
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-400">
                    <li>• Receive payouts directly to your bank</li>
                    <li>• Industry-standard fraud protection</li>
                    <li>• Takes about 5 minutes to set up</li>
                  </ul>
                </div>
              </div>
            </div>

            <PrimaryButton type="button" onClick={handleStripeConnect}>
              Connect with Stripe
            </PrimaryButton>
            <button
              type="button"
              onClick={handleSkipStripe}
              className="h-11 w-full rounded-md text-sm font-medium text-gray-400 hover:text-white"
            >
              Skip for now
            </button>
            <p className="text-center text-xs text-gray-500">
              You can finish this later from Settings. Payouts are paused until
              Stripe is connected.
            </p>
          </div>
        )}

        {step === 4 && user && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-success/20 text-accent-success">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">
                Welcome, {user.businessName || user.ownerName}!
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Your {ROLE_META[user.role].label.toLowerCase()} account is ready.
                {user.stripeConnected
                  ? ' Stripe is connected.'
                  : ' Finish Stripe later from Settings.'}
              </p>
            </div>
            <PrimaryButton
              type="button"
              onClick={() => navigate(`/dashboard/${user.role}`)}
            >
              Go to dashboard
            </PrimaryButton>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  const wrapperClass = field.colSpan === 2 ? 'sm:col-span-2' : ''

  if (field.type === 'select') {
    return (
      <div className={wrapperClass}>
        <FormSelect
          label={field.label}
          options={field.options ?? []}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className={wrapperClass}>
        <FormTextarea
          label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <FormField
        label={field.label}
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
    </div>
  )
}

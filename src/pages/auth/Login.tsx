import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const user = login(email)
    if (!user) {
      setError('No provider found with this email. Please register first.')
      return
    }
    navigate(`/dashboard/${user.role}`)
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="User login illustration" />}
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
          />

          <div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
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

          <PrimaryButton type="submit">Sign in</PrimaryButton>

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

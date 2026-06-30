import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../../../context/AuthContext'
import { hasNavAccess } from '../../../modules/permissions/resolver'
import {
  useGetPrivacyPolicyQuery,
  useGetTermsAndConditionsQuery,
} from '../../../redux/api/legalApi'

export default function LegalDocumentPage() {
  const { user } = useAuth()
  const { role, docSlug } = useParams<{ role: string; docSlug: string }>()
  const isTerms = docSlug === 'terms'
  const isPrivacy = docSlug === 'privacy'
  const isValidDoc = isTerms || isPrivacy

  const { data: termsData, isLoading: termsLoading, isError: termsError } = useGetTermsAndConditionsQuery(
    undefined,
    { skip: !isTerms },
  )
  const { data: privacyData, isLoading: privacyLoading, isError: privacyError } = useGetPrivacyPolicyQuery(
    undefined,
    { skip: !isPrivacy },
  )

  if (!user || !role) return null

  if (!hasNavAccess(user, 'legal')) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  if (!isValidDoc) {
    return <Navigate to={`/dashboard/${role}/legal`} replace />
  }

  const data = isTerms ? termsData?.data : privacyData?.data
  const isLoading = isTerms ? termsLoading : privacyLoading
  const isError = isTerms ? termsError : privacyError
  const title = isTerms ? 'Terms & Conditions' : 'Privacy Policy'
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : '—'

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={`/dashboard/${role}/legal`}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] px-4 text-sm font-medium text-gray-300 transition hover:bg-white/[0.04] hover:text-white"
      >
        <ArrowLeft size={16} /> Legal
      </Link>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-surface-card p-6">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-xs text-gray-500">Updated {updatedAt}</p>

        {isLoading ? (
          <div className="py-12 text-center">
            <Spin />
          </div>
        ) : isError ? (
          <p className="mt-6 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
            Failed to load document.
          </p>
        ) : (
          <div
            className="prose prose-invert mt-6 max-w-none prose-p:text-gray-300 prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: data?.content || '<p>No content found.</p>' }}
          />
        )}
      </div>
    </div>
  )
}

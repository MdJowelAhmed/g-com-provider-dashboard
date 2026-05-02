import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getLegalDocument } from '../../../modules/legal/content/documents'
import LegalDocShell from '../../../modules/legal/components/LegalDocShell'
import { hasNavAccess } from '../../../modules/permissions/resolver'

export default function LegalDocumentPage() {
  const { user } = useAuth()
  const { role, docSlug } = useParams<{ role: string; docSlug: string }>()

  if (!user || !role) return null

  if (!hasNavAccess(user, 'legal')) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  const doc = docSlug ? getLegalDocument(docSlug) : undefined
  if (!doc) {
    return <Navigate to={`/dashboard/${role}/legal`} replace />
  }

  return (
    <LegalDocShell
      doc={doc}
      backLink={
        <Link
          to={`/dashboard/${role}/legal`}
          className="no-print inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] px-4 text-sm font-medium text-gray-300 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft size={16} /> Legal
        </Link>
      }
    />
  )
}

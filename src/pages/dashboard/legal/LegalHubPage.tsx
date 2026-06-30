import { motion } from 'framer-motion'
import { ArrowRight, FileText, Scale } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import { LEGAL_DOC_ORDER, LEGAL_DOCUMENTS } from '../../../modules/legal/content/documents'
import type { LegalDocId } from '../../../modules/legal/types'
import { hasNavAccess } from '../../../modules/permissions/resolver'
import {
  useGetPrivacyPolicyQuery,
  useGetTermsAndConditionsQuery,
} from '../../../redux/api/legalApi'

const ICONS: Record<LegalDocId, typeof FileText> = {
  terms: Scale,
  privacy: FileText,
}

export default function LegalHubPage() {
  const { user } = useAuth()
  const { role } = useParams<{ role: string }>()
  const base = `/dashboard/${role}/legal`
  const { data: termsData } = useGetTermsAndConditionsQuery()
  const { data: privacyData } = useGetPrivacyPolicyQuery()

  if (!user || !role) return null

  if (!hasNavAccess(user, 'legal')) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  return (
    <div>
      <PageHeader
        title="Legal"
        description="Terms & Conditions and Privacy Policy for your G-com provider workspace."
      />

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {LEGAL_DOC_ORDER.map((id, idx) => {
          const doc = LEGAL_DOCUMENTS[id]
          const Icon = ICONS[id]
          const apiUpdatedAt = id === 'terms' ? termsData?.data?.updatedAt : privacyData?.data?.updatedAt
          const updatedLabel = apiUpdatedAt
            ? new Date(apiUpdatedAt).toLocaleDateString()
            : doc.lastUpdated
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.28 }}
            >
              <Link
                to={`${base}/${doc.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/[0.06] bg-surface-card/50 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-md transition hover:border-brand/35 hover:bg-surface-elevated/60 hover:shadow-[0_12px_40px_-24px_rgba(160,82,45,0.45)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand shadow-inner">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-white">{doc.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{doc.description}</p>
                <p className="mt-4 text-[11px] text-gray-600">Updated {updatedLabel}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

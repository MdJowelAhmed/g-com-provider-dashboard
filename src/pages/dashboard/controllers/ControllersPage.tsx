import { ShieldCheck, UserPlus } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import PageHeader from '../../../components/dashboard/PageHeader'
import ControllersManagementShell from '../../../modules/controllers/components/ControllersManagementShell'

export default function ControllersPage() {
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const openCreateRef = useRef<() => void>(() => {})
  const registerOpenCreate = useCallback((fn: () => void) => {
    openCreateRef.current = fn
  }, [])

  if (!user) return null

  return (
    <div>
      <PageHeader
        title="Controller management"
        description="Create staff accounts, map route permissions, and keep access aligned with how your team actually works—API-ready keys match future enforcement."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden h-10 items-center gap-2 rounded-md border border-surface-border bg-surface-card/90 px-3 text-xs text-gray-400 shadow-sm backdrop-blur-sm lg:inline-flex">
              <ShieldCheck size={16} className="text-brand" />
              RBAC · tenant-scoped
            </span>
            <button
              type="button"
              onClick={() => openCreateRef.current()}
              className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white shadow-md shadow-brand/20 transition hover:bg-brand-hover"
            >
              <UserPlus size={16} /> New controller
            </button>
          </div>
        }
      />
      <ControllersManagementShell
        tenantUserId={user.id}
        dashboardRole={dashboardRole}
        registerOpenCreate={registerOpenCreate}
      />
    </div>
  )
}

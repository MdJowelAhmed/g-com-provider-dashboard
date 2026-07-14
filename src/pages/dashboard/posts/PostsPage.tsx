import { FileText, Plus } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import { getRolePostConfig } from '../../../modules/posts/config/rolePostConfig'
import PostsManagementShell from '../../../modules/posts/components/PostsManagementShell'
import PageHeader from '../../../components/dashboard/PageHeader'

export default function PostsPage() {
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const openCreateRef = useRef<() => void>(() => {})
  const registerOpenCreate = useCallback((fn: () => void) => {
    openCreateRef.current = fn
  }, [])
  if (!user) return null

  const copy = getRolePostConfig(dashboardRole)

  return (
    <div>
      <PageHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        actions={
          <div className="flex flex-wrap items-center gap-2">
          
            <button
              type="button"
              onClick={() => openCreateRef.current()}
              className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
            >
              <Plus size={16} /> New post
            </button>
          </div>
        }
      />
      <PostsManagementShell role={dashboardRole} registerOpenCreate={registerOpenCreate} />
    </div>
  )
}

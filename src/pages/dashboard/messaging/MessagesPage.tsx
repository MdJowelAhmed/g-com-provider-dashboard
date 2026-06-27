import { useAuth } from '../../../context/AuthContext'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import type { Role } from '../../../types/role'
import MessagingShell from '../../../modules/messaging/components/MessagingShell'
import PageHeader from '../../../components/dashboard/PageHeader'

/** Role-based messaging hub — inner split view + offer modal match shared dashboard messaging layout. */
export default function MessagesPage() {
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()

  if (!user) return null

  return (
    <div className="flex min-h-[calc(100vh-8.5rem)] flex-col">
      <PageHeader
        title="Messages"
        description={`${user.businessName || user.ownerName} · ${ROLE_HINT[dashboardRole]}`}
      />
      <div className="mt-2 h-[min(780px,calc(100vh-10rem))] min-h-[480px] overflow-hidden">
        <MessagingShell role={dashboardRole} />
      </div>
    </div>
  )
}

const ROLE_HINT: Record<Role, string> = {
  dine: 'Restaurant ↔ customer threads',
  events: 'Organizer ↔ attendee threads',
  services: 'Provider ↔ customer threads',
  shops: 'Seller ↔ buyer threads',
  stay: 'Property ↔ guest threads',
}

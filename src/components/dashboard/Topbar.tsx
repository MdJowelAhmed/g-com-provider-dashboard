import { Bell, Search } from 'lucide-react'
import type { User } from '../../context/AuthContext'

type Props = {
  user: User
}

export default function Topbar({ user }: Props) {
  const initials = (user.businessName || user.ownerName || user.email)
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface-page px-6">
      <div className="relative max-w-sm flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-500"
        />
        <input
          type="search"
          placeholder="Search..."
          className="h-9 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-brand"
        />
      </div>

      <div className="flex items-center gap-4">
        {!user.stripeConnected && (
          <span className="hidden rounded-full bg-accent-amber/20 px-3 py-1 text-xs font-medium text-accent-amber md:inline-block">
            Stripe not connected
          </span>
        )}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-border text-gray-300 hover:bg-surface-elevated"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-white">
              {user.businessName || user.ownerName}
            </div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        </div>
      </div>
    </header>
  )
}

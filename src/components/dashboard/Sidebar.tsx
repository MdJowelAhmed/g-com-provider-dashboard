import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import type { NavItem, RoleMeta } from '../../config/roleConfig'
import GcomLogo from '../auth/GcomLogo'

type Props = {
  meta: RoleMeta
  onLogout: () => void
}

export default function Sidebar({ meta, onLogout }: Props) {
  const RoleIcon = meta.icon

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-surface-border bg-surface-sidebar">
      <div className="flex shrink-0 items-center gap-3 border-b border-surface-border px-5 py-5">
        <GcomLogo className="h-10 w-10 rounded-lg" />
        <div>
          <div className="text-sm font-semibold text-white">G-com Provider</div>
          <div className="flex items-center gap-1.5 text-xs text-accent-amber">
            <RoleIcon size={12} /> {meta.label}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {meta.navItems.map((item) => (
          <SidebarLink key={item.path || 'overview'} item={item} roleKey={meta.role} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-surface-border p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-gray-300 hover:bg-surface-elevated hover:text-white"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ item, roleKey }: { item: NavItem; roleKey: string }) {
  const Icon = item.icon
  const base = `/dashboard/${roleKey}`
  const to = item.path ? `${base}/${item.path}` : base

  return (
    <NavLink
      to={to}
      end={item.path === ''}
      className={({ isActive }) =>
        `flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
          isActive
            ? 'bg-brand text-white'
            : 'text-gray-300 hover:bg-surface-elevated hover:text-white'
        }`
      }
    >
      <Icon size={18} /> {item.label}
    </NavLink>
  )
}

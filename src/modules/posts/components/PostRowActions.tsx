import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
type Props = {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function PostRowActions({ onView, onEdit, onDelete }: Props) {
  const items: MenuProps['items'] = [
    {
      key: 'view',
      icon: <Eye size={14} />,
      label: 'View details',
      onClick: onView,
    },
    {
      key: 'edit',
      icon: <Pencil size={14} />,
      label: 'Edit post',
      onClick: onEdit,
    },
    { type: 'divider' },
    {
      key: 'delete',
      danger: true,
      icon: <Trash2 size={14} />,
      label: 'Delete',
      onClick: onDelete,
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-300 transition hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
        aria-label="Post actions"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={18} />
      </button>
    </Dropdown>
  )
}

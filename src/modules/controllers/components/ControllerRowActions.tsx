import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import type { StaffController } from '../types'

type Props = {
  row: StaffController
  onEdit: () => void
  onDelete: () => void
  onSetStatus: (status: StaffController['status']) => void
}

export default function ControllerRowActions({
  row,
  onEdit,
  onDelete,
  onSetStatus,
}: Props) {
  const items: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <Pencil size={14} />,
      label: 'Edit access',
      onClick: onEdit,
    },
    { type: 'divider' },
    ...(row.status !== 'active'
      ? [
          {
            key: 'on',
            icon: <Power size={14} />,
            label: 'Mark active',
            onClick: () => onSetStatus('active'),
          } as const,
        ]
      : [
          {
            key: 'off',
            icon: <PowerOff size={14} />,
            label: 'Mark inactive',
            onClick: () => onSetStatus('inactive'),
          } as const,
        ]),
    {
      key: 'sus',
      label: 'Suspend',
      onClick: () => onSetStatus('suspended'),
    },
    { type: 'divider' },
    {
      key: 'delete',
      danger: true,
      icon: <Trash2 size={14} />,
      label: 'Remove controller',
      onClick: onDelete,
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 transition hover:border-surface-border hover:bg-surface-elevated hover:text-white"
        aria-label="Controller actions"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={18} />
      </button>
    </Dropdown>
  )
}

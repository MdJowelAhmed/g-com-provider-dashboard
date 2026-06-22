import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal, Switch, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import CategoryFormModal from './CategoryFormModal'
import { mapCategoryFromApi, type BusinessCategory } from './categoryTypes'
import {
  useCreateBusinessCategoryMutation,
  useDeleteBusinessCategoryMutation,
  useGetBusinessCategoriesQuery,
  useUpdateBusinessCategoryMutation,
  type BusinessCategoryStatus,
} from '../../../redux/api/businessCategoryApi'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; category: BusinessCategory }

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

function formatCount(value: number) {
  return String(value).padStart(2, '0')
}

export default function BusinessCategoriesPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  const { data, isLoading, isFetching, isError } = useGetBusinessCategoriesQuery()
  const [createCategory, { isLoading: isCreating }] = useCreateBusinessCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateBusinessCategoryMutation()
  const [deleteCategory] = useDeleteBusinessCategoryMutation()

  const categories = useMemo(
    () => (data?.data ?? []).map((doc, index) => mapCategoryFromApi(doc, index)),
    [data?.data],
  )

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (modal.mode === 'edit') {
        await updateCategory({ id: modal.category.id, body: values }).unwrap()
        void message.success('Category updated successfully.')
      } else {
        await createCategory(values).unwrap()
        void message.success('Category created successfully.')
      }
      setModal({ mode: 'closed' })
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Something went wrong. Please try again.'))
    }
  }

  const handleStatusToggle = async (category: BusinessCategory, checked: boolean) => {
    const nextStatus: BusinessCategoryStatus = checked ? 'active' : 'inactive'
    setStatusUpdatingId(category.id)
    try {
      await updateCategory({ id: category.id, body: { status: nextStatus } }).unwrap()
      void message.success(`Category ${checked ? 'activated' : 'deactivated'}.`)
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Failed to update category status.'))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const confirmDelete = (category: BusinessCategory) => {
    Modal.confirm({
      title: 'Delete category?',
      content: (
        <span>
          Are you sure you want to delete <b>{category.name}</b>? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteCategory(category.id).unwrap()
          void message.success('Category deleted successfully.')
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Failed to delete category.'))
        }
      },
    })
  }

  const formLoading = isCreating || isUpdating

  return (
    <div>
      <PageHeader
        title="Business Category"
        description="Organize your products and services with business categories."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add New Categories
          </button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-[#f5f0e6] text-left text-xs uppercase tracking-wide text-gray-700">
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Category Name</th>
                <th className="px-4 py-3 font-semibold">Item Number</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Loading categories…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-accent-danger">
                    Failed to load categories. Please try again.
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No categories yet. Add your first category.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-4 text-gray-300">{category.sl}</td>
                    <td className="px-4 py-4 font-medium text-gray-100">{category.name}</td>
                    <td className="px-4 py-4 text-gray-300">{formatCount(category.itemCount)}</td>
                    <td className="px-4 py-4">
                      <Switch
                        checked={category.status === 'active'}
                        loading={statusUpdatingId === category.id}
                        onChange={(checked) => void handleStatusToggle(category, checked)}
                        className={category.status === 'active' ? '[&.ant-switch-checked]:bg-accent-success' : ''}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', category })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          danger
                          onClick={() => confirmDelete(category)}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.category : null}
        loading={formLoading}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function IconButton({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-elevated ${
        danger ? 'hover:text-accent-danger' : 'hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

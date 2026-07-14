import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ImageOff, Calendar, Users } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import SearchField from '../../../components/common/SearchField'
import { useSearchField } from '../../../hooks/useSearchField'
import EventFormDrawer from './EventFormDrawer'
import { EVENT_STATUS_OPTIONS, type Event, type EventFormValues } from './eventTypes'
import { formValuesToEventPayload, mapEventFromApi } from './eventMapping'
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
} from '../../../redux/api/eventApi'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; event: Event }

const allFilter = '__all__'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return `$${n.toFixed(0)}`
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function statusBadge(status: string) {
  const isActive = status === 'active'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        isActive ? 'bg-accent-success/15 text-accent-success' : 'bg-gray-600/30 text-gray-400'
      }`}
    >
      {status}
    </span>
  )
}

export default function EventsPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const { inputValue, setInputValue, searchTerm, clear, flush, isDebouncing } =
    useSearchField({ minChars: 2 })

  const { data, isLoading, isFetching, isError } = useGetEventsQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
    ...(statusFilter !== allFilter ? { status: statusFilter } : {}),
  })
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const [deleteEvent] = useDeleteEventMutation()

  const events = useMemo(() => (data?.data ?? []).map((doc) => mapEventFromApi(doc)), [data?.data])



  const handleSubmit = async (values: EventFormValues) => {
    const payload = formValuesToEventPayload(values)
    try {
      if (modal.mode === 'edit') {
        await updateEvent({ id: modal.event.id, body: payload }).unwrap()
        message.success('Event updated')
      } else if (modal.mode === 'add') {
        await createEvent(payload).unwrap()
        message.success('Event created')
      }
      setModal({ mode: 'closed' })
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          modal.mode === 'edit' ? 'Failed to update event' : 'Failed to create event',
        ),
      )
      throw error
    }
  }

  const confirmDelete = (event: Event) => {
    Modal.confirm({
      title: 'Delete event?',
      content: (
        <span>
          Delete <b>{event.name}</b>? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteEvent(event.id).unwrap()
          message.success('Event deleted')
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Failed to delete event'))
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description="Create and manage events — schedule, capacity, and ticket pricing."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Create event
          </button>
        }
      />

     

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField
          value={inputValue}
          onChange={setInputValue}
          onClear={clear}
          onFlush={flush}
          loading={isDebouncing || ((isLoading || isFetching) && Boolean(searchTerm))}
          minChars={2}
          placeholder="Search by name, organizer, or branch"
          aria-label="Search events"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {EVENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <div className="mb-4 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load events. Please refresh and try again.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Registration deadline</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 text-right font-medium">Ticket price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Loading events…
                  </td>
                </tr>
              ) : events?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No events match your filters.
                  </td>
                </tr>
              ) : (
                events?.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <EventThumb src={event.image} alt={event.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-100">{event.name}</div>
                          <div className="text-[11px] text-gray-500">{event.mainCategory ?? 'event'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{event.organizerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{event.branchName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-gray-200">
                        <Calendar size={12} className="text-gray-500" />
                        <span className="text-sm">{formatDateTime(event.startTime)}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        to {formatDateTime(event.endTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDateTime(event.registrationDeadline)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-gray-200">
                        <Users size={12} className="text-gray-500" />
                        <span>
                          {event.bookedCapacity} / {event.maxCapacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-100">
                      {formatPrice(event.ticketPrice)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(event.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', event })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(event)}>
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

      <EventFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.event : null}
        submitting={isCreating || isUpdating}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function EventThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-gray-500">
        <ImageOff size={16} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 shrink-0 rounded-md border border-surface-border bg-surface-elevated object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
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



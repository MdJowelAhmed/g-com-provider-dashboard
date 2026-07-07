import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import {
    useGetNotificationsQuery,
    useReadAllNotificationsMutation,
    useReadSingleNotificationMutation,
    type NotificationItem,
} from '../../../redux/api/notificationApi'

function getApiErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'data' in error) {
        const data = (error as FetchBaseQueryError).data
        if (data && typeof data === 'object') {
            const payload = data as { message?: unknown }
            if (typeof payload.message === 'string' && payload.message.trim()) {
                return payload.message
            }
        }
    }
    return fallback
}

function formatNotificationTime(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
}

function NotificationRow({
    item,
    onMarkRead,
    marking,
}: {
    item: NotificationItem
    onMarkRead: (id: string) => void
    marking: boolean
}) {
    return (
        <button
            type="button"
            onClick={() => !item.isRead && onMarkRead(item._id)}
            disabled={marking || item.isRead}
            className={`flex w-full items-start gap-4 rounded-lg border px-4 py-4 text-left transition-colors ${
                item.isRead
                    ? 'border-surface-border bg-surface-card/60 opacity-80'
                    : 'border-brand/30 bg-brand/5 hover:bg-brand/10'
            }`}
        >
            <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    item.isRead ? 'bg-surface-elevated text-gray-400' : 'bg-brand/20 text-brand'
                }`}
            >
                <Bell size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    {!item.isRead && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            New
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-gray-400">{item.message}</p>
                <p className="mt-2 text-xs text-gray-500">{formatNotificationTime(item.createdAt)}</p>
            </div>
        </button>
    )
}

export default function NotificationsPage() {
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading, isFetching, error } = useGetNotificationsQuery({ page, limit })
    const [readSingle, { isLoading: markingOne }] = useReadSingleNotificationMutation()
    const [readAll, { isLoading: markingAll }] = useReadAllNotificationsMutation()

    const notifications = data?.data?.notifications ?? []
    const unreadCount = data?.data?.unreadCount ?? 0
    const pagination = data?.pagination
    const hasPrev = page > 1
    const hasNext = pagination ? page < pagination.totalPage : false

    const handleMarkRead = async (id: string) => {
        try {
            await readSingle(id).unwrap()
        } catch {
            // RTK Query surfaces errors via mutation state if needed later
        }
    }

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return
        try {
            await readAll().unwrap()
        } catch {
            // ignore
        }
    }

    return (
        <div>
            <PageHeader
                title="Notifications"
                description={
                    unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                        : 'You are all caught up.'
                }
                actions={
                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        disabled={markingAll || unreadCount === 0}
                        className="flex h-10 items-center gap-2 rounded-md border border-surface-border bg-surface-card px-4 text-sm font-medium text-gray-200 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {markingAll ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <CheckCheck size={16} />
                        )}
                        Mark all as read
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                    <Loader2 size={24} className="animate-spin" />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300">
                    {getApiErrorMessage(error, 'Could not load notifications. Please try again.')}
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-lg border border-dashed border-surface-border bg-surface-card/40 px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated text-gray-500">
                        <Bell size={24} />
                    </div>
                    <h2 className="mt-4 text-lg font-medium text-white">No notifications yet</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Updates about your account and activity will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((item) => (
                        <NotificationRow
                            key={item._id}
                            item={item}
                            onMarkRead={handleMarkRead}
                            marking={markingOne}
                        />
                    ))}

                    {pagination && pagination.totalPage > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => setPage((current) => current - 1)}
                                disabled={!hasPrev || isFetching}
                                className="flex h-10 items-center rounded-md border border-surface-border px-4 text-sm text-gray-300 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {page} of {pagination.totalPage}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((current) => current + 1)}
                                disabled={!hasNext || isFetching}
                                className="flex h-10 items-center rounded-md border border-surface-border px-4 text-sm text-gray-300 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

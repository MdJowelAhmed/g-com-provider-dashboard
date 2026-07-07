import { baseApi } from './baseApi'

export interface NotificationItem {
    _id: string
    type: string
    title: string
    message: string
    receiver: string
    referenceId: string
    isRead: boolean
    createdAt: string
    updatedAt: string
}

export interface NotificationsPagination {
    total: number
    limit: number
    page: number
    totalPage: number
}

export interface NotificationsData {
    notifications: NotificationItem[]
    unreadCount: number
}

export interface NotificationsResponse {
    success: boolean
    message: string
    pagination: NotificationsPagination
    data: NotificationsData
}

export interface GetNotificationsParams {
    page?: number
    limit?: number
}

const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | undefined>({
            query: (params) => ({
                url: '/notifications/me',
                method: 'GET',
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                },
            }),
            providesTags: ['Notification'],
        }),
        readSingleNotification: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/notifications/read/${id}`,
                method: 'PATCH',
                body: {
                    isRead: true,
                },
            }),
            invalidatesTags: ['Notification'],
        }),
        readAllNotifications: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
                body: {
                    isRead: true,
                },
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
})

export const {
    useGetNotificationsQuery,
    useReadSingleNotificationMutation,
    useReadAllNotificationsMutation,
} = notificationApi

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io, type Socket } from 'socket.io-client'
import { baseApi, socketUrl } from '../redux/api/baseApi'
import type { RootState } from '../redux/store'

export const GET_NOTIFICATION_EVENT = 'getNotification'

export function useNotificationSocket() {
    const dispatch = useDispatch()
    const token = useSelector((state: RootState) => state.auth.token)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!token) return

        const socket = io(socketUrl, {
            auth: { token: `Bearer ${token}` },
            transports: ['websocket', 'polling'],
            autoConnect: true,
        })

        socketRef.current = socket

        const refreshNotifications = () => {
            dispatch(baseApi.util.invalidateTags(['Notification']))
        }

        const onConnect = () => {
            socket.emit(GET_NOTIFICATION_EVENT)
        }

        socket.on('connect', onConnect)
        socket.on(GET_NOTIFICATION_EVENT, refreshNotifications)

        return () => {
            socket.off('connect', onConnect)
            socket.off(GET_NOTIFICATION_EVENT, refreshNotifications)
            socket.disconnect()
            socketRef.current = null
        }
    }, [dispatch, token])
}

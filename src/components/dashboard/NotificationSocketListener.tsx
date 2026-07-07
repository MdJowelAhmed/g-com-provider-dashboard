import { useNotificationSocket } from '../../socket/useNotificationSocket'

/** Mount inside the authenticated dashboard shell to keep notifications live. */
export default function NotificationSocketListener() {
    useNotificationSocket()
    return null
}

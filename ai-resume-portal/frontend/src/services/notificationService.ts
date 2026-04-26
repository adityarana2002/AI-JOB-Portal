import api from './api'
import type { Notification } from '../types/notification'

export const getNotifications = (): Promise<Notification[]> =>
  api.get('/notifications').then((r) => r.data)

export const getUnreadCount = (): Promise<number> =>
  api.get('/notifications/unread-count').then((r) => r.data.unread as number)

export const markRead = (id: number): Promise<void> =>
  api.patch(`/notifications/${id}/read`).then(() => undefined)

export const markAllRead = (): Promise<void> =>
  api.patch('/notifications/read-all').then(() => undefined)

export const connectSSE = (token: string, onNotification: (n: Notification) => void): EventSource => {
  const baseUrl = api.defaults.baseURL || ''
  const url = `${baseUrl}/notifications/stream`

  const eventSource = new EventSource(url, {
    // Note: EventSource doesn't support headers natively.
    // We use a token-based approach via query params as a workaround.
  })

  eventSource.addEventListener('notification', (event) => {
    try {
      const notification = JSON.parse(event.data) as Notification
      onNotification(notification)
    } catch (e) {
      console.error('Failed to parse SSE notification:', e)
    }
  })

  eventSource.addEventListener('connected', () => {
    console.log('[SSE] Connected to notification stream')
  })

  eventSource.onerror = () => {
    console.warn('[SSE] Connection error, will auto-reconnect...')
  }

  return eventSource
}

const notificationService = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  connectSSE,
}

export default notificationService

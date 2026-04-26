import { useEffect, useState } from 'react'
import notificationService from '../../services/notificationService'
import type { Notification, NotificationType } from '../../types/notification'

const notifIcon = (type: NotificationType) => {
  if (type.startsWith('INTERVIEW')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

const notifAccent = (type: NotificationType): string => {
  if (type === 'INTERVIEW_CONFIRMED') return 'var(--success)'
  if (type === 'INTERVIEW_DECLINED' || type === 'INTERVIEW_CANCELLED') return 'var(--danger)'
  if (type === 'INTERVIEW_RESCHEDULED') return 'var(--warning)'
  if (type === 'INTERVIEW_SCHEDULED') return 'var(--accent)'
  return 'var(--muted)'
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: number) => {
    await notificationService.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const unread = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="page">
        {[1, 2, 3].map(i => <div className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 12 }} key={i} />)}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>Notifications</h3>
          <p>Stay updated on your applications and interviews.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {unread > 0 && <span className="badge danger">{unread} unread</span>}
          {unread > 0 && (
            <button className="button sm secondary" onClick={markAllRead}>Mark all read</button>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" style={{ opacity: 0.4 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <h3>All caught up!</h3>
          <p>No notifications yet.</p>
        </div>
      )}

      <div className="notif-list">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`notif-item${n.isRead ? '' : ' notif-item--unread'}`}
            onClick={() => !n.isRead && markRead(n.id)}
            role={n.isRead ? undefined : 'button'}
            tabIndex={n.isRead ? undefined : 0}
          >
            <div className="notif-item__icon" style={{ color: notifAccent(n.type) }}>
              {notifIcon(n.type)}
            </div>
            <div className="notif-item__body">
              <div className="notif-item__title">{n.title}</div>
              <div className="notif-item__msg">{n.message}</div>
              <div className="notif-item__time">
                {new Date(n.createdAt).toLocaleString(undefined, {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
            {!n.isRead && <div className="notif-item__dot" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationsPage

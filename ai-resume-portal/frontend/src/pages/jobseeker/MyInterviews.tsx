import { useEffect, useState } from 'react'
import interviewService from '../../services/interviewService'
import type { Interview, InterviewStatus } from '../../types/interview'

const statusBadge = (s: InterviewStatus) => {
  switch (s) {
    case 'CONFIRMED': return 'success'
    case 'DECLINED': return 'danger'
    case 'CANCELLED': return 'danger'
    case 'COMPLETED': return 'neutral'
    case 'RESCHEDULED': return 'warning'
    default: return 'info'
  }
}

const typeIcon = (t: string) => {
  if (t === 'VIDEO_CALL') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
  if (t === 'PHONE_CALL') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

const MyInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responding, setResponding] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getMyInterviews()
      setInterviews(data)
    } catch {
      setError('Unable to load interviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const respond = async (id: number, confirm: boolean) => {
    setResponding(id)
    try {
      const updated = await interviewService.respondToInterview(id, confirm)
      setInterviews(prev => prev.map(i => i.id === id ? updated : i))
      setToast({
        message: confirm ? 'Interview confirmed! Good luck!' : 'Interview declined.',
        type: confirm ? 'success' : 'error',
      })
    } catch {
      setToast({ message: 'Failed to respond. Please try again.', type: 'error' })
    } finally {
      setResponding(null)
    }
  }

  const upcoming = interviews.filter(i =>
    ['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(i.status)
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const past = interviews.filter(i =>
    ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(i.status)
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  if (loading) {
    return (
      <div className="page">
        <div className="card-grid">{[1, 2, 3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>My Interviews</h3>
          <p>Manage your scheduled interviews and respond to invitations.</p>
        </div>
        <span className="badge info">{upcoming.length} upcoming</span>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      {toast && (
        <div className={`action-toast action-toast--${toast.type}`} role="alert" style={{ marginBottom: 16 }}>
          <span>{toast.message}</span>
          <button className="action-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {interviews.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" style={{ opacity: 0.4 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3>No interviews yet</h3>
          <p>Once an employer schedules an interview, it will appear here.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <h4 style={{ marginBottom: 12, marginTop: 8, color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Upcoming Interviews
          </h4>
          <div className="card-grid">
            {upcoming.map(interview => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                role="SEEKER"
                responding={responding}
                onRespond={respond}
              />
            ))}
          </div>
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <h4 style={{ marginBottom: 12, marginTop: 24, color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Past Interviews
          </h4>
          <div className="card-grid">
            {past.map(interview => (
              <InterviewCard key={interview.id} interview={interview} role="SEEKER" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Shared Interview Card ─────────────────────────────────────────── */
interface InterviewCardProps {
  interview: Interview
  role: 'SEEKER' | 'EMPLOYER'
  responding?: number | null
  onRespond?: (id: number, confirm: boolean) => void
  onMarkComplete?: (id: number) => void
  onCancel?: (id: number) => void
}

export const InterviewCard = ({
  interview, role, responding, onRespond, onMarkComplete, onCancel,
}: InterviewCardProps) => {
  const dt = new Date(interview.scheduledAt)
  const isUpcoming = new Date() < dt
  const canRespond = role === 'SEEKER'
    && ['SCHEDULED', 'RESCHEDULED'].includes(interview.status)

  const typeLabel = interview.interviewType === 'VIDEO_CALL' ? 'Video Call'
    : interview.interviewType === 'PHONE_CALL' ? 'Phone Call' : 'In Person'

  return (
    <div className="card interview-card" data-status={interview.status}>
      {/* Header */}
      <div className="interview-card__header">
        <div className="interview-card__icon">{typeIcon(interview.interviewType)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="interview-card__title">{interview.jobTitle}</h3>
          <p className="interview-card__company">
            {role === 'SEEKER' ? interview.companyName : interview.applicantName}
          </p>
        </div>
        <span className={`badge ${statusBadge(interview.status)}`}>{interview.status.replace('_', ' ')}</span>
      </div>

      {/* Date/Time Row */}
      <div className="interview-card__meta">
        <div className="interview-card__meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {dt.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <div className="interview-card__meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {interview.durationMinutes} min
        </div>
        <div className="interview-card__meta-item">
          {typeIcon(interview.interviewType)}
          {typeLabel}
        </div>
      </div>

      {/* Meeting Link */}
      {interview.meetingLink && (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="button sm secondary"
          style={{ marginTop: 10, display: 'inline-flex' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Join Meeting
        </a>
      )}

      {/* Message */}
      {interview.message && (
        <div className="interview-card__message">
          <p>"{interview.message}"</p>
        </div>
      )}

      {/* Candidate note */}
      {interview.candidateNote && (
        <div className="interview-card__note">
          <strong>Your note: </strong>{interview.candidateNote}
        </div>
      )}

      {/* Actions */}
      {canRespond && onRespond && (
        <div className="applicant-card__actions" style={{ marginTop: 12 }}>
          <button
            className="button sm success"
            onClick={() => onRespond(interview.id, true)}
            disabled={responding === interview.id}
          >
            {responding === interview.id ? <span className="btn-spinner" /> : '✓ Confirm'}
          </button>
          <button
            className="button sm danger"
            onClick={() => onRespond(interview.id, false)}
            disabled={responding === interview.id}
          >
            ✕ Decline
          </button>
        </div>
      )}

      {role === 'EMPLOYER' && (
        <div className="applicant-card__actions" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(interview.status) && onMarkComplete && (
            <button className="button sm success" onClick={() => onMarkComplete(interview.id)}>
              Mark Complete
            </button>
          )}
          {['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(interview.status) && onCancel && (
            <button className="button sm danger" onClick={() => onCancel(interview.id)}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export { statusBadge, typeIcon }
export default MyInterviews

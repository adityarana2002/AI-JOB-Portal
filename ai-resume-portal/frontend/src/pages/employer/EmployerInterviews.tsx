import { useEffect, useState } from 'react'
import interviewService from '../../services/interviewService'
import type { Interview } from '../../types/interview'
import { InterviewCard } from '../jobseeker/MyInterviews'

const EmployerInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

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

  const handleMarkComplete = async (id: number) => {
    setActionLoading(id)
    try {
      const updated = await interviewService.markInterviewCompleted(id)
      setInterviews(prev => prev.map(i => i.id === id ? updated : i))
      setToast({ message: 'Interview marked as completed.', type: 'success' })
    } catch {
      setToast({ message: 'Action failed. Please try again.', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: number) => {
    setActionLoading(id)
    try {
      const updated = await interviewService.cancelInterview(id)
      setInterviews(prev => prev.map(i => i.id === id ? updated : i))
      setToast({ message: 'Interview cancelled.', type: 'success' })
    } catch {
      setToast({ message: 'Action failed. Please try again.', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const upcoming = interviews
    .filter(i => ['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(i.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const past = interviews
    .filter(i => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(i.status))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

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
          <h3>Scheduled Interviews</h3>
          <p>Track and manage all interview invitations you've sent.</p>
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
          <p>Shortlist candidates and schedule interviews from the applicants page.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h4 style={{ marginBottom: 12, marginTop: 8, color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Upcoming
          </h4>
          <div className="card-grid">
            {upcoming.map(i => (
              <InterviewCard
                key={i.id}
                interview={i}
                role="EMPLOYER"
                onMarkComplete={handleMarkComplete}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h4 style={{ marginBottom: 12, marginTop: 24, color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Past
          </h4>
          <div className="card-grid">
            {past.map(i => <InterviewCard key={i.id} interview={i} role="EMPLOYER" />)}
          </div>
        </>
      )}
    </div>
  )
}

export default EmployerInterviews

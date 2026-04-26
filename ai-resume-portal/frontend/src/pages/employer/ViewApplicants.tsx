import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import jobService from '../../services/jobService'
import applicationService from '../../services/applicationService'
import interviewService from '../../services/interviewService'
import type { CandidateRanking, ApplicationStatus } from '../../types/application'
import type { ScreeningResultResponse } from '../../types/screening'
import type { InterviewType } from '../../types/interview'

type StatusFilter = 'ALL' | ApplicationStatus

/* ── Medal badge ─────────────────────────────────────────────────── */
const getMedal = (i: number) => {
  if (i === 0) return <span className="rank-medal gold">1</span>
  if (i === 1) return <span className="rank-medal silver">2</span>
  if (i === 2) return <span className="rank-medal bronze">3</span>
  return <span className="rank-medal default">{i + 1}</span>
}

const scoreColor = (s: number) =>
  s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'

/* ── Status badge class mapping ──────────────────────────────────── */
const statusBadgeClass = (status: ApplicationStatus) => {
  switch (status) {
    case 'SHORTLISTED': return 'success'
    case 'REJECTED': return 'danger'
    case 'SCREENED': return 'info'
    case 'PENDING': return 'warning'
    default: return 'neutral'
  }
}

/* ── Inline Toast ─────────────────────────────────────────────────── */
interface ToastProps { message: string; type: 'success' | 'error'; onClose: () => void }
const Toast = ({ message, type, onClose }: ToastProps) => (
  <div className={`action-toast action-toast--${type}`} role="alert">
    {type === 'success'
      ? <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      : <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
    <span>{message}</span>
    <button className="action-toast__close" onClick={onClose} aria-label="Dismiss">✕</button>
  </div>
)

/* ── Empty state illustration ─────────────────────────────────────── */
const EmptyIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 160, height: 'auto', marginBottom: 16, opacity: 0.55 }}>
    <circle cx="100" cy="64" r="44" fill="var(--surface-muted)" />
    <circle cx="100" cy="52" r="18" fill="var(--border-strong)" />
    <path d="M64 100 Q100 88 136 100" stroke="var(--border-strong)" strokeWidth="3" strokeLinecap="round" />
    <rect x="60" y="108" width="80" height="8" rx="4" fill="var(--surface-muted)" />
    <rect x="75" y="122" width="50" height="6" rx="3" fill="var(--surface-muted)" />
    <circle cx="140" cy="30" r="12" fill="var(--surface-muted)" />
    <path d="M136 30 h8 M140 26 v8" stroke="var(--muted-light)" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* ── Confirm Dialog ───────────────────────────────────────────────── */
interface ConfirmDialogProps {
  name: string
  action: 'SHORTLISTED' | 'REJECTED'
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}
const ConfirmDialog = ({ name, action, onConfirm, onCancel, loading }: ConfirmDialogProps) => (
  <div className="confirm-overlay" role="dialog" aria-modal="true">
    <div className="confirm-dialog">
      <div className={`confirm-dialog__icon ${action === 'SHORTLISTED' ? 'success' : 'danger'}`}>
        {action === 'SHORTLISTED'
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
      </div>
      <h3>{action === 'SHORTLISTED' ? 'Shortlist Candidate?' : 'Reject Candidate?'}</h3>
      <p>
        {action === 'SHORTLISTED'
          ? `Mark ${name} as shortlisted for this role?`
          : `Reject ${name}'s application? This action notifies the candidate.`}
      </p>
      <div className="confirm-dialog__actions">
        <button className="button secondary sm" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className={`button sm ${action === 'SHORTLISTED' ? 'success' : 'danger'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <span className="btn-spinner" /> : null}
          {action === 'SHORTLISTED' ? 'Yes, Shortlist' : 'Yes, Reject'}
        </button>
      </div>
    </div>
  </div>
)

/* ── Screening Detail Modal ───────────────────────────────────────── */
interface ScreeningModalProps {
  applicationId: number
  applicantName: string
  coverLetter?: string | null
  onClose: () => void
}

const R = 48
const C = 2 * Math.PI * R

const ScreeningModal = ({ applicationId, applicantName, coverLetter, onClose }: ScreeningModalProps) => {
  const [result, setResult] = useState<ScreeningResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    applicationService.getScreening(applicationId)
      .then(setResult)
      .catch(() => setError('Unable to load screening result.'))
      .finally(() => setLoading(false))
  }, [applicationId])

  const score = result?.matchScore ?? 0
  const offset = C - (score / 100) * C
  const gaugeColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="screening-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="screening-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="screening-modal__header">
          <div>
            <h3>AI Screening Report</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{applicantName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="button sm secondary"
              onClick={() => applicationService.viewResume(applicationId).catch(() => {})}
              title="View Resume"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Resume
            </button>
            <button className="screening-modal__close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="screening-modal__body">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 16 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 16 }} />
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
          {result && !loading && (
            <>
              {/* Cover Letter */}
              {coverLetter && (
                <div className="sm-section" style={{ marginBottom: 16 }}>
                  <h4>Cover Letter</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8,
                    maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap',
                    background: 'var(--surface-muted)', borderRadius: 8, padding: '10px 12px' }}>
                    {coverLetter}
                  </p>
                </div>
              )}
              {/* Score + eligibility */}
              <div className="sm-score-row">
                <div className="sm-gauge">
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle cx="55" cy="55" r={R} fill="none"
                      stroke={gaugeColor} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={offset}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '55px 55px', transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="sm-gauge__text">
                    <span className="sm-gauge__num">{score}</span>
                    <span className="sm-gauge__label">%</span>
                  </div>
                </div>
                <div className="sm-verdict">
                  <span className={`verdict ${result.isEligible ? 'eligible' : 'not-eligible'}`} style={{ fontSize: '0.95rem' }}>
                    {result.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                  </span>
                  {result.summary && <p className="sm-summary">{result.summary}</p>}
                </div>
              </div>

              {/* Skills */}
              <div className="sm-section-grid">
                <div className="sm-section">
                  <h4>Matched Skills</h4>
                  <div className="chip-list" style={{ marginTop: 8 }}>
                    {result.matchedSkills && result.matchedSkills.length > 0
                      ? result.matchedSkills.map(s => <span className="chip green" key={s}>✓ {s}</span>)
                      : <span className="chip">None detected</span>}
                  </div>
                </div>
                <div className="sm-section">
                  <h4>Missing Skills</h4>
                  <div className="chip-list" style={{ marginTop: 8 }}>
                    {result.missingSkills && result.missingSkills.length > 0
                      ? result.missingSkills.map(s => <span className="chip red" key={s}>✗ {s}</span>)
                      : <span className="chip green">All matched!</span>}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              {((result.strengths && result.strengths.length > 0) || (result.weaknesses && result.weaknesses.length > 0)) && (
                <div className="sm-section-grid">
                  {result.strengths && result.strengths.length > 0 && (
                    <div className="sm-section">
                      <h4>Strengths</h4>
                      <ul className="sm-insight-list">
                        {result.strengths.map(item => (
                          <li key={item} className="sm-insight-item sm-insight-item--success">
                            <svg viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2" width="13" height="13" style={{ flexShrink: 0 }}>
                              <path d="M13.5 4L6 11.5l-3.5-3.5" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.weaknesses && result.weaknesses.length > 0 && (
                    <div className="sm-section">
                      <h4>Areas to Improve</h4>
                      <ul className="sm-insight-list">
                        {result.weaknesses.map(item => (
                          <li key={item} className="sm-insight-item sm-insight-item--danger">
                            <svg viewBox="0 0 16 16" fill="none" stroke="var(--danger)" strokeWidth="2" width="13" height="13" style={{ flexShrink: 0 }}>
                              <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="8.5" /><circle cx="8" cy="11" r="0.5" fill="var(--danger)" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Learning Plan */}
              {result.learningPlan && result.learningPlan.length > 0 && (
                <div className="sm-section">
                  <h4>7-Day Learning Plan</h4>
                  <div className="sm-plan-list">
                    {result.learningPlan.map(day => (
                      <div className="sm-plan-item" key={day.day}>
                        <div className="sm-plan-item__day">{day.day}</div>
                        <div className="sm-plan-item__body">
                          <span className="sm-plan-item__topic">{day.topic}</span>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span className="chip" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>{day.hours}h</span>
                            <span className={`badge ${day.priority === 'HIGH' ? 'danger' : 'warning'}`} style={{ fontSize: '0.68rem' }}>{day.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube */}
              {result.youtubeRecommendations && result.youtubeRecommendations.length > 0 && (
                <div className="sm-section">
                  <h4>YouTube Recommendations</h4>
                  <div className="sm-yt-list">
                    {result.youtubeRecommendations.map(item => (
                      <div className="sm-yt-item" key={item.skill}>
                        <div>
                          <span className="sm-yt-item__skill">{item.skill}</span>
                          <span className="sm-yt-item__channel">{item.channelName}</span>
                        </div>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`}
                          target="_blank" rel="noreferrer"
                          className="button sm"
                          style={{ flexShrink: 0 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" /><path d="M9.545 15.568V8.432L15.818 12z" fill="white" /></svg>
                          Watch
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Schedule Interview Modal ────────────────────────────────────── */
interface ScheduleModalProps {
  applicationId: number
  applicantName: string
  onClose: () => void
  onScheduled: () => void
}

const ScheduleInterviewModal = ({ applicationId, applicantName, onClose, onScheduled }: ScheduleModalProps) => {
  const [form, setForm] = useState({
    scheduledAt: '',
    meetingLink: '',
    interviewType: 'VIDEO_CALL' as InterviewType,
    durationMinutes: 60,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.scheduledAt) { setError('Please select a date and time.'); return }
    setLoading(true)
    try {
      await interviewService.scheduleInterview({
        applicationId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        meetingLink: form.meetingLink || undefined,
        interviewType: form.interviewType,
        durationMinutes: form.durationMinutes,
        message: form.message || undefined,
      })
      onScheduled()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to schedule interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const typeOptions: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
    {
      value: 'VIDEO_CALL', label: 'Video Call',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="2" y="7" width="15" height="10" rx="2"/><polyline points="17 9 22 7 22 17 17 15"/></svg>,
    },
    {
      value: 'PHONE_CALL', label: 'Phone',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.41-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    },
    {
      value: 'IN_PERSON', label: 'In Person',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
  ]

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="interview-schedule-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="interview-schedule-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.2)', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h3>Schedule Interview</h3>
              <p>with <strong style={{ color: 'rgba(255,255,255,.9)' }}>{applicantName}</strong></p>
            </div>
          </div>
          <button className="screening-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <form className="interview-schedule-modal__body" onSubmit={handleSubmit}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '.84rem', fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Interview Type — pill selector */}
          <div className="form-group">
            <label className="form-label">Interview Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, interviewType: opt.value }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: form.interviewType === opt.value ? '2px solid var(--accent)' : '1.5px solid var(--border-strong)',
                    background: form.interviewType === opt.value ? 'rgba(8,145,178,.1)' : 'var(--surface-muted)',
                    color: form.interviewType === opt.value ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all .15s ease',
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date/Time + Duration — 2-col */}
          <div className="interview-modal-row">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={form.scheduledAt}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Duration
              </label>
              <select
                className="form-control"
                value={form.durationMinutes}
                onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Meeting Link */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              Meeting Link
              <span style={{ fontWeight: 400, color: 'var(--muted-light)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
            />
          </div>

          {/* Message */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Message to Candidate
              <span style={{ fontWeight: 400, color: 'var(--muted-light)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add any instructions, agenda items, or notes for the candidate..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          {/* Footer */}
          <div className="interview-modal-footer">
            <button type="button" className="button secondary sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="button sm" disabled={loading} style={{ background: 'linear-gradient(135deg,#0b2f5c,#0a4f82,#0891b2)', color: '#fff', minWidth: 140 }}>
              {loading ? <span className="btn-spinner" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
              {loading ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────── */
const ViewApplicants = () => {
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState<CandidateRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirm, setConfirm] = useState<{
    appId: number; name: string; action: 'SHORTLISTED' | 'REJECTED'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [modalAppId, setModalAppId] = useState<number | null>(null)
  const [modalName, setModalName] = useState('')
  const [modalCoverLetter, setModalCoverLetter] = useState<string | null>(null)
  const [undoLoading, setUndoLoading] = useState<number | null>(null)
  const [scheduleApp, setScheduleApp] = useState<CandidateRanking | null>(null)

  const loadApplicants = useCallback(async () => {
    if (!jobId) return
    try {
      setLoading(true)
      const data = await jobService.getRankings(Number(jobId))
      setApplicants(data)
    } catch {
      setError('Unable to load ranked applicants for this job.')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { loadApplicants() }, [loadApplicants])

  const counts = useMemo(() => ({
    ALL: applicants.length,
    SCREENED: applicants.filter(a => a.status === 'SCREENED').length,
    SHORTLISTED: applicants.filter(a => a.status === 'SHORTLISTED').length,
    REJECTED: applicants.filter(a => a.status === 'REJECTED').length,
    PENDING: applicants.filter(a => a.status === 'PENDING' || a.status === 'SCREENING').length,
  }), [applicants])

  const filtered = useMemo(() =>
    statusFilter === 'ALL' ? applicants :
    statusFilter === 'PENDING' ? applicants.filter(a => a.status === 'PENDING' || a.status === 'SCREENING') :
    applicants.filter(a => a.status === statusFilter),
  [applicants, statusFilter])

  const handleAction = (app: CandidateRanking, action: 'SHORTLISTED' | 'REJECTED') => {
    setConfirm({ appId: app.applicationId, name: app.applicantName ?? 'Candidate', action })
  }

  const confirmAction = async () => {
    if (!confirm) return
    setActionLoading(true)
    try {
      await applicationService.updateStatus(confirm.appId, confirm.action)
      setApplicants(prev =>
        prev.map(a => a.applicationId === confirm.appId ? { ...a, status: confirm.action } : a)
      )
      setToast({
        message: confirm.action === 'SHORTLISTED'
          ? `${confirm.name} has been shortlisted.`
          : `${confirm.name}'s application has been rejected.`,
        type: 'success'
      })
    } catch {
      setToast({ message: 'Action failed. Please try again.', type: 'error' })
    } finally {
      setActionLoading(false)
      setConfirm(null)
    }
  }

  const handleUndo = async (app: CandidateRanking) => {
    setUndoLoading(app.applicationId)
    try {
      await applicationService.updateStatus(app.applicationId, 'SCREENED')
      setApplicants(prev =>
        prev.map(a => a.applicationId === app.applicationId ? { ...a, status: 'SCREENED' } : a)
      )
      setToast({ message: `Decision on ${app.applicantName ?? 'Candidate'} has been undone.`, type: 'success' })
    } catch {
      setToast({ message: 'Undo failed. Please try again.', type: 'error' })
    } finally {
      setUndoLoading(null)
    }
  }

  const openModal = (app: CandidateRanking) => {
    setModalAppId(app.applicationId)
    setModalName(app.applicantName ?? 'Candidate')
    setModalCoverLetter(app.coverLetter ?? null)
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card-grid">{[1, 2, 3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div>
      </div>
    )
  }

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'SCREENED', label: 'Screened' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'PENDING', label: 'Pending' },
  ]

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <h3>Ranked Applicants</h3>
          <p>AI-scored candidates ordered by match. Use actions to shortlist or reject.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge info">{applicants.length} candidate{applicants.length !== 1 ? 's' : ''}</span>
          {applicants.length > 0 && (
            <>
              <a
                className="button sm secondary"
                href={`/api/employer/jobs/${jobId}/export/applicants?format=csv`}
                download
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                CSV
              </a>
              <a
                className="button sm secondary"
                href={`/api/employer/jobs/${jobId}/export/applicants?format=pdf`}
                download
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </a>
            </>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-filter-tabs">
        {FILTERS.map(f => {
          const cnt = counts[f.key as keyof typeof counts] ?? 0
          if (f.key !== 'ALL' && cnt === 0) return null
          return (
            <button
              key={f.key}
              className={`status-filter-tab ${statusFilter === f.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              <span className="status-filter-tab__count">{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          name={confirm.name}
          action={confirm.action}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* Screening Modal */}
      {modalAppId !== null && (
        <ScreeningModal
          applicationId={modalAppId}
          applicantName={modalName}
          coverLetter={modalCoverLetter}
          onClose={() => setModalAppId(null)}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleApp && (
        <ScheduleInterviewModal
          applicationId={scheduleApp.applicationId}
          applicantName={scheduleApp.applicantName ?? 'Candidate'}
          onClose={() => setScheduleApp(null)}
          onScheduled={() => setToast({ message: 'Interview invitation sent!', type: 'success' })}
        />
      )}

      {/* Cards */}
      <div className="card-grid">
        {filtered.map((app, index) => {
          const score = typeof app.matchScore === 'number' ? app.matchScore : null
          const isFinal = app.status === 'SHORTLISTED' || app.status === 'REJECTED'
          const hasScreening = app.status === 'SCREENED' || app.status === 'SHORTLISTED' || app.status === 'REJECTED'

          return (
            <div className={`card applicant-card stagger-${Math.min(index + 1, 5)}`} key={app.applicationId}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {getMedal(index)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>{app.applicantName || 'Candidate'}</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>{app.applicantEmail || '—'}</p>
                </div>
              </div>

              {/* Status + Score */}
              <div className="chip-list" style={{ marginBottom: 10 }}>
                <span className={`badge ${statusBadgeClass(app.status)}`}>{app.status}</span>
                {score !== null && <span className="badge info">{score}% match</span>}
              </div>

              {/* Score bar */}
              {score !== null && (
                <div className="score-bar" style={{ marginBottom: 10 }}>
                  <div className="score-bar__fill"
                    style={{ width: `${score}%`, background: scoreColor(score) }} />
                </div>
              )}

              {/* Applied date */}
              {app.createdAt && (
                <p style={{ fontSize: '0.77rem', color: 'var(--muted-light)', marginBottom: 12 }}>
                  Applied: {new Date(app.createdAt).toLocaleDateString()}
                </p>
              )}

              {/* View AI Report button */}
              {hasScreening && (
                <button
                  className="button sm secondary"
                  style={{ marginBottom: 6, width: '100%' }}
                  onClick={() => openModal(app)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  View AI Report
                </button>
              )}

              {/* View Resume button */}
              <button
                className="button sm secondary"
                style={{ marginBottom: 10, width: '100%' }}
                onClick={async () => {
                  try { await applicationService.viewResume(app.applicationId) }
                  catch { setToast({ message: 'Resume not available.', type: 'error' }) }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                View Resume
              </button>

              {/* Action buttons */}
              {!isFinal && (
                <div className="applicant-card__actions">
                  <button
                    className="button sm success"
                    onClick={() => handleAction(app, 'SHORTLISTED')}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Shortlist
                  </button>
                  <button
                    className="button sm danger"
                    onClick={() => handleAction(app, 'REJECTED')}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </button>
                </div>
              )}

              {/* Decision badge + undo + schedule */}
              {isFinal && (
                <div>
                  <div className={`decision-badge decision-badge--${app.status === 'SHORTLISTED' ? 'success' : 'danger'}`}>
                    {app.status === 'SHORTLISTED' ? '✓ Shortlisted' : '✗ Rejected'}
                  </div>
                  {app.status === 'SHORTLISTED' && (
                    <button
                      className="button sm success"
                      style={{ width: '100%', marginTop: 8 }}
                      onClick={() => setScheduleApp(app)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Schedule Interview
                    </button>
                  )}
                  <button
                    className="undo-decision-btn"
                    onClick={() => handleUndo(app)}
                    disabled={undoLoading === app.applicationId}
                  >
                    {undoLoading === app.applicationId
                      ? <span className="btn-spinner" style={{ width: 10, height: 10 }} />
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M3 7v6h6" /><path d="M3 13C5 8 9 5 14 5c5 0 9 4 9 9s-4 9-9 9c-3 0-5.7-1.4-7.4-3.6" /></svg>}
                    Undo decision
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state */}
        {filtered.length === 0 && !error && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <EmptyIllustration />
            <h3>{statusFilter === 'ALL' ? 'No applicants yet' : `No ${statusFilter.toLowerCase()} candidates`}</h3>
            <p>{statusFilter === 'ALL' ? 'Share the role to attract more applicants.' : 'Try a different filter.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewApplicants

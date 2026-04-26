import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { Application } from '../../types/application'

const statusBadge = (s: string) => {
  if (s === 'SCREENED' || s === 'SHORTLISTED') return 'success'
  if (s === 'PENDING' || s === 'SCREENING') return 'warning'
  if (s === 'REJECTED') return 'danger'
  if (s === 'WITHDRAWN') return 'neutral'
  return 'neutral'
}

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    const loadApplications = async () => {
      try { setLoading(true); const data = await applicationService.listMyApplications(); setApplications(data) }
      catch (err) { console.error(err); setError('Unable to load applications.') }
      finally { setLoading(false) }
    }
    loadApplications()
  }, [])

  const handleWithdraw = async (id: number) => {
    try {
      setWithdrawingId(id)
      await applicationService.withdrawApplication(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a))
      setConfirmId(null)
    } catch {
      setError('Failed to withdraw application.')
    } finally {
      setWithdrawingId(null)
    }
  }

  if (loading) {
    return <div className="page"><div className="card-grid">{[1,2,3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div></div>
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div><h3>My Applications</h3><p>Track status and access AI screening results.</p></div>
      </div>
      {error && <div className="form-error" style={{marginBottom:'16px'}}>{error}</div>}
      <div className="card-grid">
        {applications.map((app, i) => (
          <div className={`card stagger-${Math.min(i+1,5)}${app.status === 'WITHDRAWN' ? ' card--withdrawn' : ''}`} key={app.id}>
            <div className="card-header">
              <div><h3 style={{fontSize:'1rem'}}>{app.jobTitle}</h3></div>
              <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
            </div>
            {app.createdAt && <p style={{fontSize:'0.78rem',color:'var(--muted-light)'}}>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>}
            <div style={{marginTop:'16px', display:'flex', gap:8, flexWrap: 'wrap'}}>
              {app.status !== 'WITHDRAWN' && (
                <Link className="button sm" to={`/jobseeker/screening/${app.id}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  View AI Screening
                </Link>
              )}
              {(app.status === 'PENDING' || app.status === 'SCREENED') && (
                <>
                  {confirmId === app.id ? (
                    <div className="withdraw-confirm">
                      <span style={{fontSize:'0.78rem', color:'var(--danger)'}}>Withdraw this application?</span>
                      <button
                        className="button sm danger"
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                      >
                        {withdrawingId === app.id ? 'Withdrawing...' : 'Yes, Withdraw'}
                      </button>
                      <button className="button sm secondary" onClick={() => setConfirmId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="button sm secondary" onClick={() => setConfirmId(app.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>
                      Withdraw
                    </button>
                  )}
                </>
              )}
              {app.status === 'WITHDRAWN' && (
                <span style={{fontSize:'0.78rem', color:'var(--muted)', fontStyle:'italic'}}>
                  Application has been withdrawn
                </span>
              )}
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3>No applications yet</h3>
            <p>Start applying to roles to see AI insights.</p>
            <Link className="button" to="/jobseeker/browse">Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications

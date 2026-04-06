import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { Application } from '../../types/application'

const statusBadge = (s: string) => {
  if (s === 'SCREENED' || s === 'SHORTLISTED') return 'success'
  if (s === 'PENDING' || s === 'SCREENING') return 'warning'
  if (s === 'REJECTED') return 'danger'
  return 'neutral'
}

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try { setLoading(true); const data = await applicationService.listMyApplications(); setApplications(data) }
      catch (err) { console.error(err); setError('Unable to load applications.') }
      finally { setLoading(false) }
    }
    loadApplications()
  }, [])

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
          <div className={`card stagger-${Math.min(i+1,5)}`} key={app.id}>
            <div className="card-header">
              <div><h3 style={{fontSize:'1rem'}}>{app.jobTitle}</h3></div>
              <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
            </div>
            {app.createdAt && <p style={{fontSize:'0.78rem',color:'var(--muted-light)'}}>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>}
            <div style={{marginTop:'16px'}}>
              <Link className="button sm" to={`/jobseeker/screening/${app.id}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                View AI Screening
              </Link>
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

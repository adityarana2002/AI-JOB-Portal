import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { AdminDashboard as AdminDashboardMetrics } from '../../types/admin'

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMetrics = async () => {
      try { const data = await adminService.getDashboard(); setMetrics(data) }
      catch (err) { console.error(err); setError('Unable to load admin metrics.') }
    }
    loadMetrics()
  }, [])

  return (
    <div className="page">
      <div className="welcome-banner" style={{background:'linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%)'}}>
        <h2>Platform Overview</h2>
        <p>Monitor users, jobs, applications, and AI screening across the entire platform.</p>
      </div>
      <div className="card-grid">
        <div className="metric-card accent-1 stagger-1">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{metrics?.totalUsers ?? '--'}</div>
              <div className="metric-card__label">Total Users</div>
            </div>
            <div className="metric-card__icon cyan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          </div>
        </div>
        <div className="metric-card accent-2 stagger-2">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{metrics?.totalJobs ?? '--'}</div>
              <div className="metric-card__label">Open Jobs</div>
            </div>
            <div className="metric-card__icon indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
          </div>
        </div>
        <div className="metric-card accent-3 stagger-3">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{metrics?.totalScreenings ?? '--'}</div>
              <div className="metric-card__label">AI Screenings</div>
            </div>
            <div className="metric-card__icon emerald"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          </div>
        </div>
        <div className="metric-card accent-4 stagger-4">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{metrics?.totalApplications ?? '--'}</div>
              <div className="metric-card__label">Applications</div>
            </div>
            <div className="metric-card__icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          </div>
        </div>
      </div>
      {error && <div className="form-error" style={{marginTop:'16px'}}>{error}</div>}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header"><div><h3>Governance</h3><p>Review flagged profiles and audit AI output quality.</p></div></div>
        <div className="chip-list" style={{ marginTop: '8px' }}>
          <span className="chip orange">Compliance</span>
          <span className="chip blue">Insights</span>
          <span className="chip purple">Trends</span>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

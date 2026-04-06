import { useAuth } from '../../context/AuthContext'

const EmployerDashboard = () => {
  const { user } = useAuth()
  return (
    <div className="page">
      <div className="welcome-banner">
        <h2>Welcome back, {user?.fullName?.split(' ')[0] ?? 'Employer'}</h2>
        <p>Manage your hiring pipeline and review AI-screened candidates.</p>
      </div>
      <div className="card-grid">
        <div className="metric-card accent-1 stagger-1">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">12</div>
              <div className="metric-card__label">Active Job Posts</div>
            </div>
            <div className="metric-card__icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
          </div>
        </div>
        <div className="metric-card accent-2 stagger-2">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">38</div>
              <div className="metric-card__label">Applicants Screened</div>
            </div>
            <div className="metric-card__icon indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
        </div>
        <div className="metric-card accent-3 stagger-3">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">42%</div>
              <div className="metric-card__label">Shortlist Rate</div>
            </div>
            <div className="metric-card__icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3>Hiring Focus</h3>
            <p>Prioritize candidates with strong technical depth.</p>
          </div>
        </div>
        <div className="chip-list" style={{ marginTop: '8px' }}>
          <span className="chip blue">Backend</span>
          <span className="chip purple">Security</span>
          <span className="chip emerald">Database</span>
          <span className="chip orange">DevOps</span>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard

import { useAuth } from '../../context/AuthContext'

const JobSeekerDashboard = () => {
  const { user } = useAuth()
  return (
    <div className="page">
      <div className="welcome-banner" style={{background:'linear-gradient(135deg,#065f46 0%,#0d9488 50%,#14b8a6 100%)'}}>
        <h2>Welcome, {user?.fullName?.split(' ')[0] ?? 'Job Seeker'}</h2>
        <p>Track your applications, review AI insights, and grow your skills.</p>
      </div>
      <div className="card-grid">
        <div className="metric-card accent-1 stagger-1">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">5</div>
              <div className="metric-card__label">Applications</div>
            </div>
            <div className="metric-card__icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
        </div>
        <div className="metric-card accent-3 stagger-2">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">2</div>
              <div className="metric-card__label">Match Highlights (70%+)</div>
            </div>
            <div className="metric-card__icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
        </div>
        <div className="metric-card accent-4 stagger-3">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">3</div>
              <div className="metric-card__label">Learning Plans</div>
            </div>
            <div className="metric-card__icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header"><div><h3>Quick Actions</h3><p>Stay on track with your job search.</p></div></div>
        <div className="chip-list" style={{ marginTop: '8px' }}>
          <span className="chip emerald">Browse new roles</span>
          <span className="chip blue">Review AI feedback</span>
          <span className="chip purple">Update resume</span>
        </div>
      </div>
    </div>
  )
}

export default JobSeekerDashboard

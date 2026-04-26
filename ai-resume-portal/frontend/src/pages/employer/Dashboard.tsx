import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import applicationService from '../../services/applicationService'
import type { EmployerStats } from '../../types/application'

/* ── Hiring Funnel SVG Illustration ─────────────────────────────── */
const HiringIllustration = () => (
  <svg viewBox="0 0 420 220" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 380, height: 'auto', opacity: 0.92 }}>
    {/* Background circles */}
    <circle cx="340" cy="40" r="60" fill="rgba(255,255,255,0.06)" />
    <circle cx="360" cy="180" r="40" fill="rgba(255,255,255,0.04)" />
    {/* Funnel shape */}
    <path d="M60 30 L360 30 L280 120 L280 190 L140 190 L140 120 Z"
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Funnel stages */}
    <line x1="80" y1="70" x2="340" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
    <line x1="110" y1="110" x2="310" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
    {/* Stage labels */}
    <text x="210" y="55" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Space Grotesk, sans-serif">ALL APPLICANTS</text>
    <text x="210" y="95" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Space Grotesk, sans-serif">AI SCREENED</text>
    <text x="210" y="158" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10" fontWeight="600" fontFamily="Space Grotesk, sans-serif">SHORTLISTED</text>
    {/* Candidate dots in top section */}
    {[70, 100, 130, 160, 190, 220, 250, 280, 310, 340].map((x, i) => (
      <circle key={i} cx={x} cy="45" r="5"
        fill={i < 3 ? 'rgba(34,211,238,0.85)' : 'rgba(255,255,255,0.25)'}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    ))}
    {/* Middle screened dots */}
    {[130, 165, 200, 235, 270].map((x, i) => (
      <circle key={i} cx={x} cy="90" r="5"
        fill={i < 2 ? 'rgba(52,211,153,0.85)' : 'rgba(255,255,255,0.25)'}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    ))}
    {/* Bottom shortlisted stars */}
    <g transform="translate(175, 168)">
      <polygon points="10,1 12.4,7.2 19,7.2 13.8,11.4 15.8,18 10,14 4.2,18 6.2,11.4 1,7.2 7.6,7.2"
        fill="rgba(251,191,36,0.9)" />
    </g>
    <g transform="translate(200, 168)">
      <polygon points="10,1 12.4,7.2 19,7.2 13.8,11.4 15.8,18 10,14 4.2,18 6.2,11.4 1,7.2 7.6,7.2"
        fill="rgba(251,191,36,0.9)" />
    </g>
    {/* AI Badge */}
    <rect x="320" y="10" width="88" height="28" rx="14"
      fill="rgba(8,145,178,0.3)" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
    <text x="364" y="28" textAnchor="middle" fill="rgba(34,211,238,1)" fontSize="10" fontWeight="700"
      fontFamily="Space Grotesk, sans-serif">AI POWERED</text>
  </svg>
)

const EmployerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<EmployerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationService.getEmployerStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number | undefined) => loading ? '—' : (n ?? 0).toString()
  const fmtScore = (n: number | undefined) => loading ? '—' : `${Math.round(n ?? 0)}%`

  return (
    <div className="page">
      {/* Welcome Banner with Illustration */}
      <div className="welcome-banner employer-banner" style={{ overflow: 'hidden', position: 'relative', minHeight: 160 }}>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <div className="welcome-banner__kicker">EMPLOYER HUB</div>
          <h2>Welcome back, {user?.fullName?.split(' ')[0] ?? 'Employer'}</h2>
          <p>Your AI-powered hiring pipeline — live data, smarter decisions.</p>
          <Link to="/employer/post-job" className="button sm" style={{ marginTop: 12, display: 'inline-flex' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
            Post a Job
          </Link>
        </div>
        <div className="welcome-banner__art" aria-hidden="true">
          <HiringIllustration />
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="card-grid" style={{ marginTop: 24 }}>
        <div className="metric-card accent-1 stagger-1">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.activeJobs)}</div>
              <div className="metric-card__label">Active Job Posts</div>
            </div>
            <div className="metric-card__icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-2 stagger-2">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.totalApplications)}</div>
              <div className="metric-card__label">Total Applications</div>
            </div>
            <div className="metric-card__icon indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-3 stagger-3">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.shortlistedCount)}</div>
              <div className="metric-card__label">Shortlisted Candidates</div>
            </div>
            <div className="metric-card__icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-4 stagger-4">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmtScore(stats?.avgMatchScore)}</div>
              <div className="metric-card__label">Avg AI Match Score</div>
            </div>
            <div className="metric-card__icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <h3>Quick Actions</h3>
            <p>Navigate your hiring workflow instantly.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <Link to="/employer/my-jobs" className="button secondary sm">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
            Manage Jobs
          </Link>
          <Link to="/employer/post-job" className="button sm">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
            Post New Job
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import applicationService from '../../services/applicationService'
import type { JobSeekerStats } from '../../types/application'

/* ── Career Growth SVG Illustration ─────────────────────────────── */
const CareerIllustration = () => (
  <svg viewBox="0 0 380 200" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 340, height: 'auto', opacity: 0.93 }}>
    {/* Background accent blobs */}
    <circle cx="300" cy="30" r="55" fill="rgba(255,255,255,0.05)" />
    <circle cx="50" cy="170" r="35" fill="rgba(255,255,255,0.04)" />
    {/* Upward path / career trajectory */}
    <path d="M30 170 Q80 160 110 130 Q150 90 200 80 Q250 70 290 40"
      stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
    {/* Step nodes on career path */}
    {[
      { cx: 30, cy: 170, label: 'Apply', col: 'rgba(255,255,255,0.4)' },
      { cx: 110, cy: 130, label: 'Screen', col: 'rgba(34,211,238,0.7)' },
      { cx: 200, cy: 80, label: 'Review', col: 'rgba(52,211,153,0.7)' },
      { cx: 290, cy: 40, label: 'Hire', col: 'rgba(251,191,36,0.9)' },
    ].map(({ cx, cy, label, col }, i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="12" fill={col} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700"
          fontFamily="Space Grotesk, sans-serif">{label}</text>
      </g>
    ))}
    {/* Resume card floating */}
    <rect x="148" y="110" width="64" height="80" rx="8"
      fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    <rect x="156" y="120" width="40" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
    <rect x="156" y="130" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    <rect x="156" y="137" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    <rect x="156" y="144" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    {/* AI sparkle icon */}
    <circle cx="212" cy="118" r="14" fill="rgba(8,145,178,0.5)" stroke="rgba(34,211,238,0.6)" strokeWidth="1" />
    <text x="212" y="123" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="14">✦</text>
    {/* Score badge */}
    <rect x="250" y="60" width="72" height="28" rx="14"
      fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.5)" strokeWidth="1" />
    <text x="286" y="78" textAnchor="middle" fill="rgba(52,211,153,1)" fontSize="11" fontWeight="700"
      fontFamily="Space Grotesk, sans-serif">87% match</text>
  </svg>
)

const JobSeekerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<JobSeekerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationService.getJobSeekerStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number | undefined) => loading ? '—' : (n ?? 0).toString()

  return (
    <div className="page">
      {/* Welcome Banner with Illustration */}
      <div className="welcome-banner seeker-banner" style={{ overflow: 'hidden', position: 'relative', minHeight: 160 }}>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <div className="welcome-banner__kicker">JOB SEEKER PORTAL</div>
          <h2>Welcome, {user?.fullName?.split(' ')[0] ?? 'Job Seeker'}</h2>
          <p>Track applications, read AI insights, and accelerate your career.</p>
          <Link to="/jobseeker/browse" className="button sm" style={{ marginTop: 12, display: 'inline-flex' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" /></svg>
            Browse Jobs
          </Link>
        </div>
        <div className="welcome-banner__art" aria-hidden="true">
          <CareerIllustration />
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="card-grid" style={{ marginTop: 24 }}>
        <div className="metric-card accent-1 stagger-1">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.totalApplications)}</div>
              <div className="metric-card__label">Total Applications</div>
            </div>
            <div className="metric-card__icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-3 stagger-2">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.highMatchCount)}</div>
              <div className="metric-card__label">High Matches (70%+)</div>
            </div>
            <div className="metric-card__icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-2 stagger-3">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.shortlistedCount)}</div>
              <div className="metric-card__label">Shortlisted</div>
            </div>
            <div className="metric-card__icon indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          {loading && <div className="metric-loading-bar" />}
        </div>

        <div className="metric-card accent-4 stagger-4">
          <div className="metric-card__top">
            <div>
              <div className="metric-card__value">{fmt(stats?.pendingCount)}</div>
              <div className="metric-card__label">Awaiting Response</div>
            </div>
            <div className="metric-card__icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
            <p>Stay on track with your job search journey.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <Link to="/jobseeker/browse" className="button sm">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" /></svg>
            Browse New Roles
          </Link>
          <Link to="/jobseeker/applications" className="button secondary sm">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
            My Applications
          </Link>
        </div>
      </div>
    </div>
  )
}

export default JobSeekerDashboard


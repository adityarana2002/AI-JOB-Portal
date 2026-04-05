import { Outlet } from 'react-router-dom'

const AuthLayout = () => (
  <div className="auth-shell">
    <section className="auth-hero">
      <div className="auth-hero__inner">
        <span className="badge">AI Resume Portal</span>
        <h1>Hire with clarity. Apply with confidence.</h1>
        <p>
          Automate resume screening with a transparent scoring system, and give
          candidates an actionable learning path.
        </p>
        <div className="card" style={{ marginTop: '32px', background: 'rgba(255, 255, 255, 0.1)' }}>
          <strong>What you get</strong>
          <div className="chip-list" style={{ marginTop: '12px' }}>
            <span className="chip">Match scores</span>
            <span className="chip">Skill gaps</span>
            <span className="chip">7-day plans</span>
            <span className="chip">Faster hiring</span>
          </div>
        </div>
      </div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <Outlet />
      </div>
    </section>
  </div>
)

export default AuthLayout

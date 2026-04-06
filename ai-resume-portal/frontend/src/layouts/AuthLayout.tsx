import { Outlet } from 'react-router-dom'

const AuthLayout = () => (
  <div className="auth-shell">
    <section className="auth-hero">
      <div className="auth-hero__inner">
        <div className="brand-block">
          <img className="brand-logo brand-logo-hero" src={new URL('../images/app-logo.png', import.meta.url).href} alt="ScreenIQ" />
        </div>
        <span className="hero-kicker">AI Recruitment &amp; Matching</span>
        <h1>Precision hiring intelligence for modern teams.</h1>
        <p>
          Move from resume overload to high-confidence decisions with transparent
          fit scoring, actionable feedback, and role-based workflows.
        </p>
        <div className="auth-hero__panel">
          <strong>Why ScreenIQ</strong>
          <ul className="value-list">
            <li>Evidence-backed candidate scorecards</li>
            <li>Automated skill-gap summaries</li>
            <li>Actionable 7-day learning plans</li>
          </ul>
        </div>
        <div className="auth-hero__stats">
          <div className="auth-stat reveal-1">
            <span className="auth-stat__label">Avg screening time</span>
            <strong className="auth-stat__value">12 sec</strong>
          </div>
          <div className="auth-stat reveal-2">
            <span className="auth-stat__label">Pipeline clarity</span>
            <strong className="auth-stat__value">93%</strong>
          </div>
          <div className="auth-stat reveal-3">
            <span className="auth-stat__label">Actionable insights</span>
            <strong className="auth-stat__value">7-day plans</strong>
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

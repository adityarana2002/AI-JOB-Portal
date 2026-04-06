import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login({ email, password })
    } catch (err) {
      setError('Invalid credentials. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page auth-page-login">
      <div className="auth-page__header">
        <span className="auth-kicker">Secure workspace access</span>
        <h2>Welcome back</h2>
        <p>Sign in to manage hiring pipelines, applications, and AI screening insights.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Email</label>
          <div className="icon-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required id="login-email" />
          </div>
        </div>
        <div className="form-row">
          <label>Password</label>
          <div className="password-field">
            <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required id="login-password" />
            <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
              {showPw ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>
        <div className="login-meta">
          <label className="checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <span className="link-muted">Need help?</span>
        </div>
        {error && <div className="form-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error}</div>}
        <button className="button" type="submit" disabled={submitting} id="login-submit">
          {submitting ? <><span className="btn-spinner" /> Signing in...</> : 'Sign in'}
        </button>
      </form>
      <div className="auth-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Protected by JWT authentication, encrypted transport, and role-based access control.
      </div>
      <div className="auth-footer">
        New here? <Link to="/auth/register">Create an account</Link>
      </div>
    </div>
  )
}

export default LoginPage

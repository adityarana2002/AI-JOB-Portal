import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/user'

const RegisterPage = () => {
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER' as UserRole,
    phone: '',
    companyName: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        companyName: form.role === 'EMPLOYER' ? form.companyName : undefined,
      })
    } catch (err) {
      setError('Registration failed. Please check your details.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="auth-page__header">
        <span className="auth-kicker">Get started</span>
        <h2>Create your account</h2>
        <p>Set up a workspace for hiring, applying, and AI screening.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Full name</label>
          <div className="icon-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input className="input" placeholder="John Doe" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required id="register-name" />
          </div>
        </div>
        <div className="form-row two">
          <div className="form-row">
            <label>Email</label>
            <div className="icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} required id="register-email" />
            </div>
          </div>
          <div className="form-row">
            <label>Phone</label>
            <div className="icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} id="register-phone" />
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>Password</label>
          <div className="password-field">
            <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => updateField('password', e.target.value)} required id="register-password" />
            <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
              {showPw ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-row">
          <label>I want to</label>
          <div className="role-selector">
            <div className={`role-card ${form.role === 'JOB_SEEKER' ? 'selected' : ''}`} onClick={() => updateField('role', 'JOB_SEEKER')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div className="role-card__title">Find a Job</div>
              <div className="role-card__desc">Browse roles & get AI feedback</div>
            </div>
            <div className={`role-card ${form.role === 'EMPLOYER' ? 'selected' : ''}`} onClick={() => updateField('role', 'EMPLOYER')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <div className="role-card__title">Hire Talent</div>
              <div className="role-card__desc">Post jobs & screen resumes</div>
            </div>
          </div>
        </div>
        {form.role === 'EMPLOYER' && (
          <div className="form-row">
            <label>Company name</label>
            <div className="icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              <input className="input" placeholder="Acme Corp" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} required id="register-company" />
            </div>
          </div>
        )}
        {error && <div className="form-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error}</div>}
        <button className="button" type="submit" disabled={submitting} id="register-submit">
          {submitting ? <><span className="btn-spinner" /> Creating account...</> : 'Create account'}
        </button>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/auth/login">Sign in</Link>
      </div>
    </div>
  )
}

export default RegisterPage

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import type { UserRole } from '../../types/user'

const RegisterPage = () => {
  const { register } = useAuth()
  const [step, setStep] = useState<'form' | 'otp'>('form')
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
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Resend timer
  useEffect(() => {
    if (otpResendTimer <= 0) return
    const interval = setInterval(() => {
      setOtpResendTimer(prev => prev <= 1 ? 0 : prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [otpResendTimer])

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await authService.sendOtp(form.email)
      setStep('otp')
      setOtpResendTimer(60)
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send verification code.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = [...otpDigits]
    for (let i = 0; i < paste.length; i++) {
      newDigits[i] = paste[i]
    }
    setOtpDigits(newDigits)
    const focusIdx = Math.min(paste.length, 5)
    otpInputRefs.current[focusIdx]?.focus()
  }

  const handleVerifyAndRegister = async () => {
    const otp = otpDigits.join('')
    if (otp.length !== 6) { setError('Please enter the full 6-digit code.'); return }
    setOtpVerifying(true)
    setError('')
    try {
      await authService.verifyOtp(form.email, otp)
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        companyName: form.role === 'EMPLOYER' ? form.companyName : undefined,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed. Please check the code.'
      setError(msg)
    } finally {
      setOtpVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpSending(true)
    setError('')
    try {
      await authService.sendOtp(form.email)
      setOtpResendTimer(60)
      setOtpDigits(['', '', '', '', '', ''])
      otpInputRefs.current[0]?.focus()
    } catch {
      setError('Failed to resend code.')
    } finally {
      setOtpSending(false)
    }
  }

  if (step === 'otp') {
    return (
      <div>
        <div className="auth-page__header">
          <div className="otp-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
          <span className="auth-kicker">Email verification</span>
          <h2>Check your inbox</h2>
          <p>We sent a 6-digit code to <strong>{form.email}</strong></p>
        </div>
        <div className="otp-container">
          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={el => { otpInputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-input${digit ? ' otp-input--filled' : ''}`}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                autoFocus={i === 0}
                id={`otp-digit-${i}`}
              />
            ))}
          </div>
          {error && (
            <div className="form-error" style={{ marginTop: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}
          <button
            className="button"
            onClick={handleVerifyAndRegister}
            disabled={otpVerifying || otpDigits.join('').length < 6}
            style={{ marginTop: 20, width: '100%' }}
            id="verify-otp-submit"
          >
            {otpVerifying ? <><span className="btn-spinner" /> Verifying...</> : 'Verify & Create Account'}
          </button>
          <div className="otp-resend">
            {otpResendTimer > 0 ? (
              <span>Resend code in <strong>{otpResendTimer}s</strong></span>
            ) : (
              <button
                className="link-button"
                onClick={handleResendOtp}
                disabled={otpSending}
              >
                {otpSending ? 'Sending...' : 'Resend verification code'}
              </button>
            )}
          </div>
          <button className="link-button" onClick={() => { setStep('form'); setError('') }} style={{ marginTop: 8 }}>
            ← Back to registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="auth-page__header">
        <span className="auth-kicker">Get started</span>
        <h2>Create your account</h2>
        <p>Set up a workspace for hiring, applying, and AI screening.</p>
      </div>
      <form className="form-grid" onSubmit={handleSendOtp}>
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
          {submitting ? <><span className="btn-spinner" /> Sending verification...</> : 'Continue with Email Verification'}
        </button>
        <p className="otp-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'text-bottom', marginRight:4}}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          A 6-digit verification code will be sent to your email
        </p>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/auth/login">Sign in</Link>
      </div>
    </div>
  )
}

export default RegisterPage

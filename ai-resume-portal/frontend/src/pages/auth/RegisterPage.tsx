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
      <h2>Create your account</h2>
      <p>Set up a workspace for hiring, applying, and AI screening.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />
        </div>
        <div className="form-row two">
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <label>Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Role</label>
          <select className="select" value={form.role} onChange={(e) => updateField('role', e.target.value)}>
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        {form.role === 'EMPLOYER' && (
          <div className="form-row">
            <label>Company name</label>
            <input className="input" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} required />
          </div>
        )}
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/auth/login">Sign in</Link>
      </div>
    </div>
  )
}

export default RegisterPage

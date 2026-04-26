import { useEffect, useState } from 'react'
import userService from '../../services/userService'
import type { UserProfile } from '../../types/user'
import type { UpdateProfileRequest } from '../../types/user'

const roleLabel = (role: string) =>
  role === 'EMPLOYER' ? 'Employer' : role === 'ADMIN' ? 'Admin' : 'Job Seeker'

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<UpdateProfileRequest>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    userService.getProfile()
      .then(p => {
        setProfile(p)
        setForm({ fullName: p.fullName, phone: p.phone ?? '', companyName: p.companyName ?? '' })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userService.updateProfile(form)
      setProfile(updated)
      setToast({ message: 'Profile updated successfully.', type: 'success' })
      setEditMode(false)
    } catch {
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 180, borderRadius: 16, maxWidth: 600 }} />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>My Profile</h3>
          <p>View and update your account details.</p>
        </div>
        {!editMode && (
          <button className="button sm secondary" onClick={() => setEditMode(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {toast && (
        <div className={`action-toast action-toast--${toast.type}`} role="alert" style={{ marginBottom: 16 }}>
          <span>{toast.message}</span>
          <button className="action-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="card profile-card" style={{ maxWidth: 620 }}>
        {/* Avatar / Identity */}
        <div className="profile-card__avatar-row">
          <div className="profile-card__avatar">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{profile.fullName}</h3>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>{profile.email}</p>
            <span className="badge info" style={{ marginTop: 6 }}>{roleLabel(profile.role)}</span>
          </div>
        </div>

        {/* Read-only View */}
        {!editMode && (
          <div className="profile-card__fields">
            <div className="profile-card__field">
              <span className="profile-card__label">Full Name</span>
              <span className="profile-card__value">{profile.fullName}</span>
            </div>
            <div className="profile-card__field">
              <span className="profile-card__label">Email</span>
              <span className="profile-card__value">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="profile-card__field">
                <span className="profile-card__label">Phone</span>
                <span className="profile-card__value">{profile.phone}</span>
              </div>
            )}
            {profile.companyName && (
              <div className="profile-card__field">
                <span className="profile-card__label">Company</span>
                <span className="profile-card__value">{profile.companyName}</span>
              </div>
            )}
            {profile.createdAt && (
              <div className="profile-card__field">
                <span className="profile-card__label">Member since</span>
                <span className="profile-card__value">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {editMode && (
          <form className="profile-card__form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                value={form.fullName ?? ''}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={profile.email} disabled style={{ opacity: 0.6 }} />
              <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Email cannot be changed.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                placeholder="+1 555 000 0000"
                value={form.phone ?? ''}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                maxLength={20}
              />
            </div>
            {profile.role === 'EMPLOYER' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  className="form-control"
                  placeholder="Acme Corp"
                  value={form.companyName ?? ''}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  maxLength={150}
                />
              </div>
            )}
            <div className="confirm-dialog__actions" style={{ marginTop: 8 }}>
              <button type="button" className="button secondary sm" onClick={() => setEditMode(false)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="button sm" disabled={saving}>
                {saving ? <span className="btn-spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

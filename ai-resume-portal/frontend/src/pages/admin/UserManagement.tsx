import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { AdminUser } from '../../types/admin'

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadUsers = async () => {
    try { setLoading(true); const data = await adminService.listUsers(); setUsers(data) }
    catch (err) { console.error(err); setError('Unable to load users.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  const toggleStatus = async (user: AdminUser) => {
    try {
      const updated = await adminService.updateUserStatus(user.id, !user.isActive)
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
    } catch (err) { console.error(err); setError('Unable to update user status.') }
  }

  const roleBadge = (role: string) => {
    if (role === 'EMPLOYER') return 'employer'
    if (role === 'JOB_SEEKER') return 'seeker'
    return 'admin-badge'
  }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page"><div className="skeleton" style={{height:'400px',borderRadius:'20px'}} /></div>

  return (
    <div className="page">
      <div className="data-table-wrap">
        <div className="table-header">
          <div><h3>User Management</h3><p>Activate or deactivate accounts across roles.</p></div>
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {error && <div className="form-error" style={{margin:'12px 20px'}}>{error}</div>}
        <table className="data-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div className="user-avatar" style={{width:'32px',height:'32px',fontSize:'0.75rem'}}>
                      {user.fullName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <span style={{fontWeight:600}}>{user.fullName}</span>
                  </div>
                </td>
                <td style={{color:'var(--muted)'}}>{user.email}</td>
                <td><span className={`badge ${roleBadge(user.role)}`}>{user.role.replace('_', ' ')}</span></td>
                <td><span className={`badge ${user.isActive ? 'success' : 'danger'}`}><span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}/>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className={`button sm ${user.isActive ? 'danger' : 'success'}`} onClick={() => toggleStatus(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state" style={{padding:'32px'}}><h3>No users found</h3><p>Users will appear once they register.</p></div>}
      </div>
    </div>
  )
}

export default UserManagement

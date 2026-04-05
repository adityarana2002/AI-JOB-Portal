import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { AdminUser } from '../../types/admin'

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.listUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleStatus = async (user: AdminUser) => {
    try {
      const updated = await adminService.updateUserStatus(user.id, !user.isActive)
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
    } catch (err) {
      console.error(err)
      setError('Unable to update user status.')
    }
  }

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>User management</h3>
        <p>Activate or deactivate accounts across roles.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {users.map((user) => (
          <div className="card" key={user.id}>
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              <span className="chip">{user.role.replace('_', ' ')}</span>
              <span className="chip">{user.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <button className="button" style={{ marginTop: '16px' }} onClick={() => toggleStatus(user)}>
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <div className="card">
            <h3>No users yet</h3>
            <p>System will list users once they register.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement

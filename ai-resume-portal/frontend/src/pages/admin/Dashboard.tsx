import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { AdminDashboard as AdminDashboardMetrics } from '../../types/admin'

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await adminService.getDashboard()
        setMetrics(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load admin metrics.')
      }
    }

    loadMetrics()
  }, [])

  return (
    <div className="page">
      <div className="card-grid">
        <div className="card">
          <h3>Total Users</h3>
          <p>Active employers and seekers onboarded.</p>
          <strong>{metrics?.totalUsers ?? '--'}</strong>
        </div>
        <div className="card">
          <h3>Open Jobs</h3>
          <p>Roles currently listed by employers.</p>
          <strong>{metrics?.totalJobs ?? '--'}</strong>
        </div>
        <div className="card">
          <h3>AI Screens</h3>
          <p>Daily screenings and insights generated.</p>
          <strong>{metrics?.totalScreenings ?? '--'}</strong>
        </div>
        <div className="card">
          <h3>Applications</h3>
          <p>Total applications submitted.</p>
          <strong>{metrics?.totalApplications ?? '--'}</strong>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Governance</h3>
        <p>Review flagged profiles and audit AI output quality.</p>
        <div className="chip-list" style={{ marginTop: '12px' }}>
          <span className="chip">Compliance</span>
          <span className="chip">Insights</span>
          <span className="chip">Trends</span>
        </div>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
    </div>
  )
}

export default AdminDashboard

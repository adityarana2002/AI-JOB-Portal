import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { Application } from '../../types/application'

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        const data = await applicationService.listMyApplications()
        setApplications(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load applications.')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>My applications</h3>
        <p>Track status and access AI screening results.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {applications.map((application) => (
          <div className="card" key={application.id}>
            <h3>{application.jobTitle}</h3>
            <p>Status: {application.status}</p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link className="button secondary" to={`/jobseeker/screening/${application.id}`}>
                View screening
              </Link>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="card">
            <h3>No applications yet</h3>
            <p>Start applying to roles to see AI insights.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications

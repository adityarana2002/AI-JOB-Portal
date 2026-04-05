import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { Application } from '../../types/application'

const AllApplicants = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        const data = await adminService.listApplications()
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
        <h3>All applications</h3>
        <p>Track submissions and their latest statuses.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {applications.map((application) => (
          <div className="card" key={application.id}>
            <h3>{application.jobTitle ?? 'Job'}</h3>
            <p>Status: {application.status}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              {application.applicantName && <span className="chip">{application.applicantName}</span>}
              {application.applicantEmail && <span className="chip">{application.applicantEmail}</span>}
            </div>
            {application.coverLetter && <p style={{ marginTop: '12px' }}>{application.coverLetter}</p>}
          </div>
        ))}
        {applications.length === 0 && (
          <div className="card">
            <h3>No applications yet</h3>
            <p>Applications will appear once job seekers apply.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllApplicants

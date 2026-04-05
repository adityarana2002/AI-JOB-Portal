import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Application } from '../../types/application'

const ViewApplicants = () => {
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplicants = async () => {
      if (!jobId) return
      try {
        setLoading(true)
        const data = await jobService.getApplicants(Number(jobId))
        setApplicants(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load applicants for this job.')
      } finally {
        setLoading(false)
      }
    }

    loadApplicants()
  }, [jobId])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading applicants...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Applicants</h3>
        <p>Review candidate details and their current screening status.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {applicants.map((application) => (
          <div className="card" key={application.id}>
            <h3>{application.applicantName || 'Candidate'}</h3>
            <p>{application.applicantEmail || 'Email unavailable'}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              <span className="chip">Status: {application.status}</span>
              <span className="chip">Applied</span>
            </div>
            {application.coverLetter && (
              <p style={{ marginTop: '12px' }}>
                {application.coverLetter}
              </p>
            )}
          </div>
        ))}
        {applicants.length === 0 && !error && (
          <div className="card">
            <h3>No applicants yet</h3>
            <p>Share the role to attract more applicants.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewApplicants

import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { Job } from '../../types/job'

const AllJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        const data = await adminService.listJobs()
        setJobs(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>All jobs</h3>
        <p>Monitor active and closed jobs across employers.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {jobs.map((job) => (
          <div className="card" key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.location} · {job.jobType.replace('_', ' ')}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              <span className="chip">{job.isActive ? 'Active' : 'Closed'}</span>
              {job.employerCompany && <span className="chip">{job.employerCompany}</span>}
            </div>
            <p style={{ marginTop: '12px' }}>{job.requiredSkills}</p>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="card">
            <h3>No jobs available</h3>
            <p>Jobs will appear once employers post them.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllJobs

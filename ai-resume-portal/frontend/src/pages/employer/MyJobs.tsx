import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Job } from '../../types/job'

const MyJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadJobs = async () => {
    try {
      setLoading(true)
      const data = await jobService.getMyJobs()
      setJobs(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleClose = async (id: number) => {
    try {
      await jobService.deleteJob(id)
      setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, isActive: false } : job)))
    } catch (err) {
      console.error(err)
      setError('Unable to close job.')
    }
  }

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
        <h3>My job listings</h3>
        <p>Manage live roles and check applicant pipelines.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {jobs.map((job) => (
          <div className="card" key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.location} · {job.jobType.replace('_', ' ')}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              {job.requiredSkills.split(',').slice(0, 3).map((skill) => (
                <span className="chip" key={skill}>{skill.trim()}</span>
              ))}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link className="button secondary" to={`/employer/jobs/${job.id}/applicants`}>View applicants</Link>
              <button className="button" onClick={() => handleClose(job.id)} disabled={!job.isActive}>
                {job.isActive ? 'Close job' : 'Closed'}
              </button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="card">
            <h3>No jobs yet</h3>
            <p>Post your first role to start screening applicants.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyJobs

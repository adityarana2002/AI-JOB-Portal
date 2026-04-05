import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Job } from '../../types/job'

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        const data = await jobService.listJobs()
        setJobs(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load jobs right now.')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Fetching jobs...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Browse roles</h3>
        <p>Find a role that matches your strengths and goals.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {jobs.map((job) => (
          <div className="card" key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.location} · {job.jobType.replace('_', ' ')}</p>
            <p style={{ marginTop: '12px' }}>{job.description}</p>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              {job.requiredSkills.split(',').slice(0, 4).map((skill) => (
                <span className="chip" key={skill}>{skill.trim()}</span>
              ))}
            </div>
            <Link className="button" style={{ marginTop: '16px' }} to={`/jobseeker/apply/${job.id}`}>
              Apply now
            </Link>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="card">
            <h3>No jobs available</h3>
            <p>Check back soon for new openings.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseJobs

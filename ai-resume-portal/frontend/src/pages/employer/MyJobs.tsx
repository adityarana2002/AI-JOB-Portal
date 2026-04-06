import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Job } from '../../types/job'

const typeClass = (t: string) => t.toLowerCase().replace('_', '-')

const MyJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadJobs = async () => {
    try { setLoading(true); const data = await jobService.getMyJobs(); setJobs(data) }
    catch (err) { console.error(err); setError('Unable to load jobs.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadJobs() }, [])

  const handleClose = async (id: number) => {
    try { await jobService.deleteJob(id); setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, isActive: false } : job))) }
    catch (err) { console.error(err); setError('Unable to close job.') }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card-grid">
          {[1,2,3].map(i => <div className="skeleton skeleton-card" key={i} style={{animationDelay:`${i*100}ms`}} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>My Job Listings</h3>
          <p>Manage live roles and check applicant pipelines.</p>
        </div>
        <Link className="button" to="/employer/post-job">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post new job
        </Link>
      </div>
      {error && <div className="form-error" style={{marginBottom:'16px'}}>{error}</div>}
      <div className="card-grid">
        {jobs.map((job, i) => (
          <div className={`job-card stagger-${Math.min(i+1,5)}`} key={job.id}>
            <div className="job-card__top">
              <div className="job-card__avatar">{job.title.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="job-card__title">{job.title}</div>
                <div className="job-card__meta">
                  <span className="job-card__meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {job.location}
                  </span>
                  <span className={`job-type-badge ${typeClass(job.jobType)}`}>{job.jobType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="chip-list">
              {job.requiredSkills.split(',').slice(0, 4).map((skill) => (
                <span className="chip" key={skill}>{skill.trim()}</span>
              ))}
            </div>
            <div className="job-card__footer">
              <span className={`badge ${job.isActive ? 'success' : 'danger'}`}>
                <span className={`status-dot ${job.isActive ? 'active' : 'inactive'}`} />
                {job.isActive ? 'Active' : 'Closed'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link className="button secondary sm" to={`/employer/jobs/${job.id}/applicants`}>Applicants</Link>
                <button className="button sm danger" onClick={() => handleClose(job.id)} disabled={!job.isActive}>
                  {job.isActive ? 'Close' : 'Closed'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <h3>No jobs yet</h3>
            <p>Post your first role to start screening applicants with AI.</p>
            <Link className="button" to="/employer/post-job">Post a Job</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyJobs

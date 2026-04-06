import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Job } from '../../types/job'

const typeClass = (t: string) => t.toLowerCase().replace('_', '-')

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try { setLoading(true); const data = await jobService.listJobs(); setJobs(data) }
      catch (err) { console.error(err); setError('Unable to load jobs right now.') }
      finally { setLoading(false) }
    }
    loadJobs()
  }, [])

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.requiredSkills.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="page"><div className="card-grid">{[1,2,3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div></div>
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div><h3>Browse Roles</h3><p>Find a role that matches your strengths and goals.</p></div>
        <div className="table-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search jobs, skills, location..." value={search} onChange={(e) => setSearch(e.target.value)} id="browse-search" />
        </div>
      </div>
      {error && <div className="form-error" style={{marginBottom:'16px'}}>{error}</div>}
      <div className="card-grid">
        {filtered.map((job, i) => (
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
            <p className="job-card__desc">{job.description}</p>
            <div className="chip-list" style={{marginTop:'10px'}}>
              {job.requiredSkills.split(',').slice(0, 4).map((skill) => (
                <span className="chip" key={skill}>{skill.trim()}</span>
              ))}
            </div>
            <div className="job-card__footer">
              {job.salaryRange && <span style={{fontSize:'0.8rem',color:'var(--muted)'}}>💰 {job.salaryRange}</span>}
              <Link className="button sm" to={`/jobseeker/apply/${job.id}`}>
                Apply now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No jobs found</h3>
            <p>{search ? 'Try a different search term.' : 'Check back soon for new openings.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseJobs

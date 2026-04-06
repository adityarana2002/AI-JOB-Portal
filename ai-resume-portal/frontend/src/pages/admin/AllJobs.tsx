import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { Job } from '../../types/job'

const AllJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try { setLoading(true); const data = await adminService.listJobs(); setJobs(data) }
      catch (err) { console.error(err); setError('Unable to load jobs.') }
      finally { setLoading(false) }
    }
    loadJobs()
  }, [])

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="page"><div className="skeleton" style={{height:'400px',borderRadius:'20px'}} /></div>

  return (
    <div className="page">
      <div className="data-table-wrap">
        <div className="table-header">
          <div><h3>All Jobs</h3><p>Monitor active and closed jobs across employers.</p></div>
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {error && <div className="form-error" style={{margin:'12px 20px'}}>{error}</div>}
        <table className="data-table">
          <thead><tr><th>Title</th><th>Location</th><th>Type</th><th>Company</th><th>Skills</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(job => (
              <tr key={job.id}>
                <td style={{fontWeight:600}}>{job.title}</td>
                <td>{job.location}</td>
                <td><span className={`job-type-badge ${job.jobType.toLowerCase().replace('_','-')}`}>{job.jobType.replace('_',' ')}</span></td>
                <td>{job.employerCompany || '—'}</td>
                <td><div className="chip-list">{job.requiredSkills.split(',').slice(0,2).map(s => <span className="chip" key={s} style={{fontSize:'0.7rem',padding:'2px 8px'}}>{s.trim()}</span>)}</div></td>
                <td><span className={`badge ${job.isActive ? 'success' : 'danger'}`}><span className={`status-dot ${job.isActive ? 'active' : 'inactive'}`}/>{job.isActive ? 'Active' : 'Closed'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state" style={{padding:'32px'}}><h3>No jobs found</h3><p>Jobs will appear once employers post them.</p></div>}
      </div>
    </div>
  )
}

export default AllJobs

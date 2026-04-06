import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { Application } from '../../types/application'

const statusBadge = (s: string) => {
  if (s === 'SCREENED' || s === 'SHORTLISTED') return 'success'
  if (s === 'PENDING' || s === 'SCREENING') return 'warning'
  if (s === 'REJECTED') return 'danger'
  return 'neutral'
}

const AllApplicants = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try { setLoading(true); const data = await adminService.listApplications(); setApplications(data) }
      catch (err) { console.error(err); setError('Unable to load applications.') }
      finally { setLoading(false) }
    }
    loadApplications()
  }, [])

  const filtered = applications.filter(a =>
    (a.jobTitle ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.applicantName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.applicantEmail ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page"><div className="skeleton" style={{height:'400px',borderRadius:'20px'}} /></div>

  return (
    <div className="page">
      <div className="data-table-wrap">
        <div className="table-header">
          <div><h3>All Applications</h3><p>Track submissions and their latest statuses.</p></div>
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {error && <div className="form-error" style={{margin:'12px 20px'}}>{error}</div>}
        <table className="data-table">
          <thead><tr><th>Job Title</th><th>Applicant</th><th>Email</th><th>Status</th><th>Cover Letter</th></tr></thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id}>
                <td style={{fontWeight:600}}>{app.jobTitle ?? 'Job'}</td>
                <td>{app.applicantName ?? '—'}</td>
                <td style={{color:'var(--muted)'}}>{app.applicantEmail ?? '—'}</td>
                <td><span className={`badge ${statusBadge(app.status)}`}>{app.status}</span></td>
                <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{app.coverLetter || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state" style={{padding:'32px'}}><h3>No applications yet</h3><p>Applications will appear once job seekers apply.</p></div>}
      </div>
    </div>
  )
}

export default AllApplicants

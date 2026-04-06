import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { ScreeningReport } from '../../types/admin'

const scoreColor = (s: number) => s >= 70 ? 'success' : s >= 40 ? 'warning' : 'danger'

const ScreeningReports = () => {
  const [reports, setReports] = useState<ScreeningReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      try { setLoading(true); const data = await adminService.listScreenings(); setReports(data) }
      catch (err) { console.error(err); setError('Unable to load screening reports.') }
      finally { setLoading(false) }
    }
    loadReports()
  }, [])

  const filtered = reports.filter(r =>
    (r.jobTitle ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.applicantName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page"><div className="skeleton" style={{height:'400px',borderRadius:'20px'}} /></div>

  return (
    <div className="page">
      <div className="data-table-wrap">
        <div className="table-header">
          <div><h3>Screening Reports</h3><p>Review AI decisions across applications.</p></div>
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {error && <div className="form-error" style={{margin:'12px 20px'}}>{error}</div>}
        <table className="data-table">
          <thead><tr><th>Job</th><th>Candidate</th><th>Score</th><th>Eligibility</th><th>Missing Skills</th><th>Summary</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{fontWeight:600}}>{r.jobTitle ?? 'Job'}</td>
                <td>{r.applicantName ?? 'Candidate'}</td>
                <td><span className={`badge ${scoreColor(r.matchScore ?? 0)}`}>{r.matchScore ?? 0}%</span></td>
                <td><span className={`badge ${r.isEligible ? 'success' : 'danger'}`}>{r.isEligible ? '✓ Eligible' : '✗ Not Eligible'}</span></td>
                <td><div className="chip-list">{r.missingSkills?.slice(0,2).map(s => <span className="chip red" key={s} style={{fontSize:'0.7rem',padding:'2px 8px'}}>{s}</span>)}{(!r.missingSkills || r.missingSkills.length === 0) && <span className="chip green" style={{fontSize:'0.7rem',padding:'2px 8px'}}>All matched</span>}</div></td>
                <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--muted)'}}>{r.summary || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state" style={{padding:'32px'}}><h3>No screenings yet</h3><p>Reports will appear once AI screening runs.</p></div>}
      </div>
    </div>
  )
}

export default ScreeningReports

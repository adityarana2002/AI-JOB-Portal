import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { CandidateRanking } from '../../types/application'

const getMedal = (i: number) => {
  if (i === 0) return <span className="rank-medal gold">1</span>
  if (i === 1) return <span className="rank-medal silver">2</span>
  if (i === 2) return <span className="rank-medal bronze">3</span>
  return <span className="rank-medal default">{i + 1}</span>
}

const scoreColor = (s: number) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'

const ViewApplicants = () => {
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState<CandidateRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplicants = async () => {
      if (!jobId) return
      try { setLoading(true); const data = await jobService.getRankings(Number(jobId)); setApplicants(data) }
      catch (err) { console.error(err); setError('Unable to load ranked applicants for this job.') }
      finally { setLoading(false) }
    }
    loadApplicants()
  }, [jobId])

  if (loading) {
    return <div className="page"><div className="card-grid">{[1,2,3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div></div>
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div><h3>Ranked Applicants</h3><p>Candidates ordered by AI screening score and status priority.</p></div>
      </div>
      {error && <div className="form-error" style={{marginBottom:'16px'}}>{error}</div>}
      <div className="card-grid">
        {applicants.map((app, index) => {
          const score = typeof app.matchScore === 'number' ? app.matchScore : null
          return (
            <div className={`card stagger-${Math.min(index+1,5)}`} key={app.applicationId}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                {getMedal(index)}
                <div style={{flex:1,minWidth:0}}>
                  <h3 style={{fontSize:'1rem'}}>{app.applicantName || 'Candidate'}</h3>
                  <p style={{margin:0}}>{app.applicantEmail || 'Email unavailable'}</p>
                </div>
              </div>
              <div className="chip-list">
                <span className={`badge ${app.status === 'SCREENED' ? 'success' : app.status === 'PENDING' ? 'warning' : 'neutral'}`}>
                  {app.status}
                </span>
                {score !== null && <span className="badge info">{score}% match</span>}
              </div>
              {score !== null && (
                <div className="score-bar" style={{marginTop:'12px'}}>
                  <div className="score-bar__fill" style={{width:`${score}%`,background:scoreColor(score)}} />
                </div>
              )}
              {app.rankingReason && <p style={{marginTop:'10px',fontSize:'0.85rem'}}>{app.rankingReason}</p>}
              {app.createdAt && <p style={{marginTop:'6px',fontSize:'0.78rem',color:'var(--muted-light)'}}>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>}
            </div>
          )
        })}
        {applicants.length === 0 && !error && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <h3>No applicants yet</h3>
            <p>Share the role to attract more applicants.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewApplicants

import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import type { ScreeningReport } from '../../types/admin'

const ScreeningReports = () => {
  const [reports, setReports] = useState<ScreeningReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        const data = await adminService.listScreenings()
        setReports(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load screening reports.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading screenings...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Screening reports</h3>
        <p>Review AI decisions across applications.</p>
        {error && <div style={{ color: '#b91c1c', marginTop: '12px' }}>{error}</div>}
      </div>
      <div className="card-grid" style={{ marginTop: '24px' }}>
        {reports.map((report) => (
          <div className="card" key={report.id}>
            <h3>{report.jobTitle ?? 'Job'}</h3>
            <p>{report.applicantName ?? 'Candidate'}</p>
            <div className="badge" style={{ marginTop: '12px' }}>
              {report.matchScore ?? 0}% match
            </div>
            <div className="chip-list" style={{ marginTop: '12px' }}>
              <span className="chip">{report.isEligible ? 'Eligible' : 'Not eligible'}</span>
              {report.missingSkills?.slice(0, 2).map((skill) => (
                <span className="chip" key={skill}>{skill}</span>
              ))}
            </div>
            {report.summary && <p style={{ marginTop: '12px' }}>{report.summary}</p>}
          </div>
        ))}
        {reports.length === 0 && (
          <div className="card">
            <h3>No screenings yet</h3>
            <p>Reports will appear once AI screening runs.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScreeningReports

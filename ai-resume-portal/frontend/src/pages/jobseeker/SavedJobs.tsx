import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { JobResponse } from '../../types/job'

const SavedJobs = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    jobService.getSavedJobs()
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [])

  const handleUnsave = async (jobId: number) => {
    setRemoving(jobId)
    try {
      await jobService.toggleBookmark(jobId)
      setJobs(prev => prev.filter(j => j.id !== jobId))
      setToast('Job removed from saved list.')
    } catch {
      setToast('Failed to unsave. Please try again.')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card-grid">{[1, 2, 3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>Saved Jobs</h3>
          <p>Jobs you've bookmarked for later.</p>
        </div>
        <span className="badge info">{jobs.length} saved</span>
      </div>

      {toast && (
        <div className="action-toast action-toast--success" role="alert" style={{ marginBottom: 16 }}>
          <span>{toast}</span>
          <button className="action-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" style={{ opacity: 0.4 }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No saved jobs</h3>
          <p>Browse jobs and bookmark the ones you're interested in.</p>
          <button className="button" onClick={() => navigate('/jobseeker/browse-jobs')}>Browse Jobs</button>
        </div>
      )}

      <div className="card-grid">
        {jobs.map(job => (
          <div className="card job-card" key={job.id}>
            <div className="job-card__header">
              <div>
                <h3 className="job-card__title">{job.title}</h3>
                <p className="job-card__company">{job.companyName}</p>
              </div>
              <button
                className="bookmark-btn bookmark-btn--saved"
                title="Remove from saved"
                onClick={() => handleUnsave(job.id)}
                disabled={removing === job.id}
                aria-label="Remove bookmark"
              >
                {removing === job.id
                  ? <span className="btn-spinner" style={{ width: 14, height: 14 }} />
                  : (
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" width="17" height="17">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
              </button>
            </div>

            <div className="job-card__meta">
              {job.location && (
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.jobType && <span className="badge info" style={{ fontSize: '0.72rem' }}>{job.jobType}</span>}
              {job.salaryRange && <span className="badge neutral" style={{ fontSize: '0.72rem' }}>{job.salaryRange}</span>}
            </div>

            {job.description && (
              <p className="job-card__desc">{job.description.length > 130 ? job.description.slice(0, 130) + '…' : job.description}</p>
            )}

            <div className="job-card__footer">
              <button className="button sm" onClick={() => navigate(`/jobseeker/apply/${job.id}`)}>
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavedJobs

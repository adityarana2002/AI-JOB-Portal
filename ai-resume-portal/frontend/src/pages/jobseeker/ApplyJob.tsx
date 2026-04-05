import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import jobService from '../../services/jobService'
import applicationService from '../../services/applicationService'
import type { Job } from '../../types/job'

const ApplyJob = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return
      try {
        setLoading(true)
        const data = await jobService.getJob(Number(jobId))
        setJob(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load job details.')
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [jobId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!jobId || !resume) {
      setError('Please upload a resume file before submitting.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const application = await applicationService.applyToJob(Number(jobId), resume, coverLetter)
      navigate(`/jobseeker/screening/${application.id}`, { replace: true })
    } catch (err) {
      console.error(err)
      setError('Unable to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading job...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page center">
        <div className="card">Job not found.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Apply for {job.title}</h3>
        <p>{job.location} · {job.jobType.replace('_', ' ')}</p>
        <p style={{ marginTop: '12px' }}>{job.description}</p>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Submit your resume</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Resume (PDF)</label>
            <input className="input" type="file" accept="application/pdf" onChange={(e) => setResume(e.target.files?.[0] ?? null)} required />
          </div>
          <div className="form-row">
            <label>Cover letter</label>
            <textarea className="textarea" rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          </div>
          {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApplyJob

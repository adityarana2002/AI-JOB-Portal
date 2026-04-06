import { useEffect, useState, useRef } from 'react'
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
  const [dragover, setDragover] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return
      try { setLoading(true); const data = await jobService.getJob(Number(jobId)); setJob(data) }
      catch (err) { console.error(err); setError('Unable to load job details.') }
      finally { setLoading(false) }
    }
    loadJob()
  }, [jobId])

  const handleFile = (file: File | null) => {
    if (file && file.type === 'application/pdf') setResume(file)
    else if (file) setError('Please upload a PDF file.')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!jobId || !resume) { setError('Please upload a resume file before submitting.'); return }
    setSubmitting(true); setError('')
    try {
      const application = await applicationService.applyToJob(Number(jobId), resume, coverLetter)
      navigate(`/jobseeker/screening/${application.id}`, { replace: true })
    } catch (err) { console.error(err); setError('Unable to submit application. Please try again.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="page"><div className="skeleton skeleton-card" style={{height:'200px'}} /><div className="skeleton skeleton-card" style={{height:'300px',marginTop:'16px'}} /></div>
  if (!job) return <div className="page center"><div className="card">Job not found.</div></div>

  return (
    <div className="page">
      <div className="card">
        <div className="job-card__top">
          <div className="job-card__avatar" style={{background:'linear-gradient(135deg,var(--role-seeker),#14b8a6)'}}>{job.title.charAt(0)}</div>
          <div>
            <h3>{job.title}</h3>
            <div className="job-card__meta">
              <span className="job-card__meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{job.location}</span>
              <span className={`job-type-badge ${job.jobType.toLowerCase().replace('_','-')}`}>{job.jobType.replace('_',' ')}</span>
            </div>
          </div>
        </div>
        <p style={{ marginTop: '12px', fontSize:'0.9rem', color:'var(--muted)' }}>{job.description}</p>
        <div className="chip-list" style={{marginTop:'12px'}}>
          {job.requiredSkills.split(',').map(s => <span className="chip" key={s}>{s.trim()}</span>)}
        </div>
      </div>
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Submit Your Application</h3>
        <p>Upload your resume and let AI analyze your fit.</p>
        <form className="form-grid" onSubmit={handleSubmit} style={{marginTop:'16px'}}>
          <div
            className={`dropzone ${dragover ? 'dragover' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {e.preventDefault(); setDragover(true)}}
            onDragLeave={() => setDragover(false)}
            onDrop={(e) => {e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0] ?? null)}}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="dropzone__text"><strong>Click to upload</strong> or drag and drop</p>
            <p className="dropzone__text">PDF only, max 10MB</p>
            {resume && <div className="dropzone__file"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>{resume.name}</div>}
            <input ref={fileRef} type="file" accept="application/pdf" style={{display:'none'}} onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="form-row">
            <label>Cover letter (optional)</label>
            <textarea className="textarea" rows={4} placeholder="Tell them why you're a great fit..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} id="apply-cover-letter" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="button" type="submit" disabled={submitting} id="apply-submit">
            {submitting ? <><span className="btn-spinner" /> Submitting & screening...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit application</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApplyJob

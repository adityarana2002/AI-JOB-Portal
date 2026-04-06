import { useState } from 'react'
import jobService from '../../services/jobService'
import type { JobRequest, JobType } from '../../types/job'

const PostJob = () => {
  const [form, setForm] = useState<JobRequest>({
    title: '', description: '', requiredSkills: '', experienceRequired: '',
    salaryRange: '', location: '', jobType: 'FULL_TIME', deadline: '',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (key: keyof JobRequest, value: string | JobType) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true); setStatus(''); setError('')
    try {
      await jobService.createJob({ ...form, deadline: form.deadline || undefined })
      setStatus('Job posted successfully!')
      setForm({ title: '', description: '', requiredSkills: '', experienceRequired: '', salaryRange: '', location: '', jobType: 'FULL_TIME', deadline: '' })
    } catch (err) { console.error(err); setError('Unable to post job. Please try again.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h3>Create a new job</h3>
          <p>Publish a role with clear skills, location, and expectations.</p>
        </div>
      </div>
      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Job title</label>
            <div className="icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <input className="input" placeholder="e.g. Senior React Developer" value={form.title} onChange={(e) => updateField('title', e.target.value)} required id="post-job-title" />
            </div>
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea className="textarea" rows={4} placeholder="Describe the role, responsibilities, and what you're looking for..." value={form.description} onChange={(e) => updateField('description', e.target.value)} required id="post-job-desc" />
          </div>
          <div className="form-row">
            <label>Required skills (comma separated)</label>
            <div className="icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <input className="input" placeholder="e.g. React, TypeScript, Node.js" value={form.requiredSkills} onChange={(e) => updateField('requiredSkills', e.target.value)} required id="post-job-skills" />
            </div>
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label>Experience</label>
              <input className="input" placeholder="e.g. 2-4 years" value={form.experienceRequired} onChange={(e) => updateField('experienceRequired', e.target.value)} id="post-job-exp" />
            </div>
            <div className="form-row">
              <label>Salary range</label>
              <input className="input" placeholder="e.g. ₹8-12 LPA" value={form.salaryRange} onChange={(e) => updateField('salaryRange', e.target.value)} id="post-job-salary" />
            </div>
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label>Location</label>
              <div className="icon-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input className="input" placeholder="e.g. Bangalore, Remote" value={form.location} onChange={(e) => updateField('location', e.target.value)} required id="post-job-location" />
              </div>
            </div>
            <div className="form-row">
              <label>Job type</label>
              <select className="select" value={form.jobType} onChange={(e) => updateField('jobType', e.target.value as JobType)} id="post-job-type">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={(e) => updateField('deadline', e.target.value)} id="post-job-deadline" />
          </div>
          {status && <div className="form-success">✓ {status}</div>}
          {error && <div className="form-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error}</div>}
          <button className="button" type="submit" disabled={submitting} id="post-job-submit">
            {submitting ? <><span className="btn-spinner" /> Posting...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Post job</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostJob

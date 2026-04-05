import { useState } from 'react'
import jobService from '../../services/jobService'
import type { JobRequest, JobType } from '../../types/job'

const PostJob = () => {
  const [form, setForm] = useState<JobRequest>({
    title: '',
    description: '',
    requiredSkills: '',
    experienceRequired: '',
    salaryRange: '',
    location: '',
    jobType: 'FULL_TIME',
    deadline: '',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (key: keyof JobRequest, value: string | JobType) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    setError('')

    try {
      await jobService.createJob({
        ...form,
        deadline: form.deadline || undefined,
      })
      setStatus('Job posted successfully.')
      setForm({
        title: '',
        description: '',
        requiredSkills: '',
        experienceRequired: '',
        salaryRange: '',
        location: '',
        jobType: 'FULL_TIME',
        deadline: '',
      })
    } catch (err) {
      console.error(err)
      setError('Unable to post job. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Create a new job</h3>
        <p>Publish a role with clear skills, location, and expectations.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Job title</label>
            <input className="input" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea className="textarea" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Required skills (comma separated)</label>
            <input className="input" value={form.requiredSkills} onChange={(e) => updateField('requiredSkills', e.target.value)} required />
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label>Experience</label>
              <input className="input" value={form.experienceRequired} onChange={(e) => updateField('experienceRequired', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Salary range</label>
              <input className="input" value={form.salaryRange} onChange={(e) => updateField('salaryRange', e.target.value)} />
            </div>
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label>Location</label>
              <input className="input" value={form.location} onChange={(e) => updateField('location', e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Job type</label>
              <select className="select" value={form.jobType} onChange={(e) => updateField('jobType', e.target.value as JobType)}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={(e) => updateField('deadline', e.target.value)} />
          </div>
          {status && <div style={{ color: '#047857' }}>{status}</div>}
          {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post job'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostJob

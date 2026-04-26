import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import jobService from '../../services/jobService'
import type { Job, JobType } from '../../types/job'

const typeClass = (t: string) => t.toLowerCase().replace('_', '-')

type SortOption = 'newest' | 'oldest' | 'az' | 'za'

const JOB_TYPES: { value: JobType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<JobType | 'ALL'>('ALL')
  const [sort, setSort] = useState<SortOption>('newest')
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [bookmarking, setBookmarking] = useState<number | null>(null)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        const data = await jobService.listJobs()
        setJobs(data)
        const savedIds = await jobService.getSavedJobs()
        setBookmarked(new Set(savedIds.map(j => j.id)))
      } catch (err) { console.error(err); setError('Unable to load jobs right now.') }
      finally { setLoading(false) }
    }
    loadJobs()
  }, [])

  const toggleBookmark = async (jobId: number) => {
    setBookmarking(jobId)
    try {
      const result = await jobService.toggleBookmark(jobId)
      setBookmarked(prev => {
        const next = new Set(prev)
        if (result.saved) next.add(jobId)
        else next.delete(jobId)
        return next
      })
    } catch { /* silent */ } finally { setBookmarking(null) }
  }

  const filtered = useMemo(() => {
    let list = jobs.filter(j => {
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.requiredSkills.toLowerCase().includes(q) ||
        (j.employerCompany ?? '').toLowerCase().includes(q)
      const matchesType = typeFilter === 'ALL' || j.jobType === typeFilter
      return matchesSearch && matchesType
    })
    list = [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      if (sort === 'oldest') return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'za') return b.title.localeCompare(a.title)
      return 0
    })
    return list
  }, [jobs, search, typeFilter, sort])

  if (loading) {
    return <div className="page"><div className="card-grid">{[1,2,3].map(i => <div className="skeleton skeleton-card" key={i} />)}</div></div>
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div><h3>Browse Roles</h3><p>Find a role that matches your strengths and goals.</p></div>
        <div className="table-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search jobs, skills, location..." value={search} onChange={(e) => setSearch(e.target.value)} id="browse-search" />
        </div>
      </div>

      <div className="browse-filters">
        <div className="browse-filters__group">
          {JOB_TYPES.map(opt => (
            <button
              key={opt.value}
              className={`filter-pill ${typeFilter === opt.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="browse-filters__sort">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="filter-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Title A–Z</option>
            <option value="za">Title Z–A</option>
          </select>
        </div>
      </div>

      {error && <div className="form-error" style={{marginBottom:'16px'}}>{error}</div>}
      <div className="browse-count">{filtered.length} {filtered.length === 1 ? 'role' : 'roles'} found</div>
      <div className="card-grid">
        {filtered.map((job, i) => (
          <div className={`job-card stagger-${Math.min(i+1,5)}`} key={job.id}>
            <div className="job-card__top">
              <div className="job-card__avatar">{job.title.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="job-card__title">{job.title}</div>
                <div className="job-card__meta">
                  <span className="job-card__meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {job.location}
                  </span>
                  <span className={`job-type-badge ${typeClass(job.jobType)}`}>{job.jobType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <p className="job-card__desc">{job.description}</p>
            <div className="chip-list" style={{marginTop:'10px'}}>
              {job.requiredSkills.split(',').slice(0, 4).map((skill) => (
                <span className="chip" key={skill}>{skill.trim()}</span>
              ))}
            </div>
            <div className="job-card__footer">
              {job.salaryRange && <span style={{fontSize:'0.8rem',color:'var(--muted)'}}>💰 {job.salaryRange}</span>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className={`bookmark-btn${bookmarked.has(job.id) ? ' bookmark-btn--saved' : ''}`}
                  title={bookmarked.has(job.id) ? 'Remove from saved' : 'Save job'}
                  onClick={() => toggleBookmark(job.id)}
                  disabled={bookmarking === job.id}
                  aria-label="Toggle bookmark"
                >
                  {bookmarking === job.id
                    ? <span className="btn-spinner" style={{ width: 13, height: 13 }} />
                    : <svg viewBox="0 0 24 24" fill={bookmarked.has(job.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>}
                </button>
                <Link className="button sm" to={`/jobseeker/apply/${job.id}`}>
                  Apply now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No jobs found</h3>
            <p>{search || typeFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Check back soon for new openings.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseJobs

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { ScreeningResultResponse } from '../../types/screening'

const R = 60, C = 2 * Math.PI * R

const gaugeColor = (s: number) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'

const ScreeningResult = () => {
  const { applicationId } = useParams()
  const [result, setResult] = useState<ScreeningResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadResult = async () => {
      if (!applicationId) return
      try { setLoading(true); const data = await applicationService.getScreening(Number(applicationId)); setResult(data) }
      catch (err) { console.error(err); setError('Unable to load screening result.') }
      finally { setLoading(false) }
    }
    loadResult()
  }, [applicationId])

  if (loading) return <div className="page"><div className="skeleton" style={{height:'200px',borderRadius:'20px'}} /><div className="card-grid" style={{marginTop:'20px'}}>{[1,2].map(i => <div className="skeleton skeleton-card" key={i} />)}</div></div>
  if (!result) return <div className="page center"><div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>No screening result</h3><p>Result will appear once AI screening completes.</p></div></div>

  const score = result.matchScore ?? 0
  const offset = C - (score / 100) * C

  return (
    <div className="page">
      {/* Score Card */}
      <div className="card" style={{textAlign:'center',padding:'32px'}}>
        <h3 style={{marginBottom:'20px'}}>AI Screening Result</h3>
        <div className="score-gauge">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle className="score-gauge__bg" cx="70" cy="70" r={R} />
            <circle className="score-gauge__fill" cx="70" cy="70" r={R}
              stroke={gaugeColor(score)}
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{'--gauge-circumference': C, '--gauge-offset': offset, animation: 'gaugeAppear 1.2s var(--ease-out) forwards'} as React.CSSProperties}
            />
          </svg>
          <div className="score-gauge__text">
            <span className="score-gauge__number">{score}</span>
            <span className="score-gauge__label">Match %</span>
          </div>
        </div>
        <div style={{marginTop:'16px'}}>
          <span className={`verdict ${result.isEligible ? 'eligible' : 'not-eligible'}`}>
            {result.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
          </span>
        </div>
        {result.summary && <p style={{marginTop:'16px',maxWidth:'520px',margin:'16px auto 0',color:'var(--muted)',fontSize:'0.9rem'}}>{result.summary}</p>}
      </div>

      {/* Skills */}
      <div className="card-grid" style={{marginTop:'20px'}}>
        <div className="card">
          <h3>Matched Skills</h3>
          <div className="chip-list" style={{marginTop:'12px'}}>
            {result.matchedSkills?.map(s => <span className="chip green" key={s}>✓ {s}</span>)}
            {(!result.matchedSkills || result.matchedSkills.length === 0) && <span className="chip">None detected</span>}
          </div>
        </div>
        <div className="card">
          <h3>Missing Skills</h3>
          <div className="chip-list" style={{marginTop:'12px'}}>
            {result.missingSkills?.map(s => <span className="chip red" key={s}>✗ {s}</span>)}
            {(!result.missingSkills || result.missingSkills.length === 0) && <span className="chip green">All skills matched!</span>}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="card-grid" style={{marginTop:'20px'}}>
        <div className="card">
          <h3>Strengths</h3>
          <div className="insight-list">
            {result.strengths?.map(item => (
              <div className="insight-item strength" key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Areas to Improve</h3>
          <div className="insight-list">
            {result.weaknesses?.map(item => (
              <div className="insight-item weakness" key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Plan */}
      {result.learningPlan && result.learningPlan.length > 0 && (
        <div className="card" style={{marginTop:'20px'}}>
          <h3>7-Day Learning Plan</h3>
          <p style={{marginBottom:'16px'}}>Personalized roadmap to close your skill gaps.</p>
          <div className="timeline">
            {result.learningPlan.map(day => (
              <div className={`timeline-item ${day.priority?.toLowerCase() === 'high' ? 'high' : 'medium'}`} key={day.day}>
                <div className="timeline-item__day">{day.day}</div>
                <div className="timeline-item__topic">{day.topic}</div>
                <ul className="timeline-item__tasks">
                  {day.tasks.map(task => <li key={task}>{task}</li>)}
                </ul>
                <div className="timeline-item__meta">
                  <span className="chip">{day.hours}h</span>
                  <span className={`badge ${day.priority === 'HIGH' ? 'danger' : 'warning'}`}>{day.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube */}
      {result.youtubeRecommendations && result.youtubeRecommendations.length > 0 && (
        <div style={{marginTop:'20px'}}>
          <div className="section-header"><h3>YouTube Recommendations</h3><p>Learn missing skills from the best channels.</p></div>
          <div className="card-grid">
            {result.youtubeRecommendations.map(item => (
              <div className="yt-card" key={item.skill}>
                <div className="yt-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div className="yt-card__skill">{item.skill}</div>
                <div className="yt-card__channel">{item.channelName}</div>
                <p className="yt-card__reason">{item.reason}</p>
                <a className="button sm" style={{marginTop:'12px'}} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`} target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch on YouTube
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="form-error" style={{marginTop:'20px'}}>{error}</div>}
    </div>
  )
}

export default ScreeningResult

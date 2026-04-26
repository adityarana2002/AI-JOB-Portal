import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { ScreeningResultResponse, YoutubeRecommendation } from '../../types/screening'

const R = 62
const C = 2 * Math.PI * R

const gaugeColor = (s: number) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'

const getScoreMessage = (score: number, eligible: boolean): string => {
  if (eligible) return "You're a strong match! The employer will love your profile."
  if (score >= 60) return "You're close! Bridge a few skill gaps to become eligible."
  if (score >= 40) return "Good foundation. Follow the learning plan to qualify."
  return "Skill gaps detected. Your personalized roadmap is ready below."
}

const findYtForSkill = (recs: YoutubeRecommendation[] | undefined, skill: string) =>
  recs?.find(y =>
    y.skill.toLowerCase().includes(skill.toLowerCase()) ||
    skill.toLowerCase().includes(y.skill.toLowerCase())
  )

const ScreeningResult = () => {
  const { applicationId } = useParams()
  const [result, setResult] = useState<ScreeningResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [journeyOpen, setJourneyOpen] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const journeyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!applicationId) return
    applicationService.getScreening(Number(applicationId))
      .then(setResult)
      .catch(err => { console.error(err); setError('Unable to load screening result.') })
      .finally(() => setLoading(false))
  }, [applicationId])

  const openJourney = () => {
    setJourneyOpen(true)
    setTimeout(() => journeyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  if (loading) return (
    <div className="page">
      <div className="skeleton" style={{ height: 220, borderRadius: 24, marginBottom: 20 }} />
      <div className="card-grid">{[1, 2].map(i => <div className="skeleton skeleton-card" key={i} />)}</div>
    </div>
  )

  if (error || !result) return (
    <div className="page center">
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>No screening result</h3>
        <p>{error || 'Result will appear once AI screening completes.'}</p>
      </div>
    </div>
  )

  const score = result.matchScore ?? 0
  const offset = C - (score / 100) * C
  const matched = result.matchedSkills?.length ?? 0
  const missing = result.missingSkills?.length ?? 0
  const totalSkills = matched + missing || 1
  const skillCoverage = Math.round((matched / totalSkills) * 100)

  return (
    <div className="page sr-page">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className={`sr-hero ${result.isEligible ? 'sr-hero--eligible' : 'sr-hero--gap'}`}>
        <div className="sr-hero__gauge-wrap">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="11" />
            <circle cx="75" cy="75" r={R} fill="none"
              stroke="white" strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px', transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)' }}
            />
          </svg>
          <div className="sr-hero__gauge-text">
            <span className="sr-hero__score">{score}</span>
            <span className="sr-hero__score-lbl">Match %</span>
          </div>
        </div>

        <div className="sr-hero__info">
          <div className={`sr-hero__verdict ${result.isEligible ? 'eligible' : 'not-eligible'}`}>
            {result.isEligible
              ? <><svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Eligible for this role</>
              : <><svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Not eligible yet</>}
          </div>
          <p className="sr-hero__msg">{getScoreMessage(score, result.isEligible ?? false)}</p>
          {result.summary && <p className="sr-hero__summary">{result.summary}</p>}
          <div className="sr-hero__stats">
            <div className="sr-hero__stat">
              <span className="sr-hero__stat-num">{matched}</span>
              <span className="sr-hero__stat-lbl">Matched</span>
            </div>
            <div className="sr-hero__stat-div" />
            <div className="sr-hero__stat">
              <span className="sr-hero__stat-num">{missing}</span>
              <span className="sr-hero__stat-lbl">Missing</span>
            </div>
            <div className="sr-hero__stat-div" />
            <div className="sr-hero__stat">
              <span className="sr-hero__stat-num">{skillCoverage}%</span>
              <span className="sr-hero__stat-lbl">Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skill Coverage Bar ─────────────────────────────────────── */}
      <div className="card sr-coverage-card">
        <div className="sr-coverage__label">
          <span>Skill Coverage</span>
          <span>{matched} of {matched + missing} skills matched</span>
        </div>
        <div className="sr-coverage-bar">
          <div className="sr-coverage-bar__fill" style={{ width: `${skillCoverage}%`, background: gaugeColor(skillCoverage) }} />
        </div>
        <div className="sr-skills-row">
          <div className="sr-skills-col">
            <span className="sr-skills-col__title">
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2.5" width="12" height="12"><path d="M2.5 8l4 4 7-7" /></svg>
              You have
            </span>
            <div className="chip-list">
              {result.matchedSkills?.map(s => <span className="chip green" key={s}>{s}</span>)}
              {(!result.matchedSkills || result.matchedSkills.length === 0) && <span className="chip">None detected</span>}
            </div>
          </div>
          <div className="sr-skills-col">
            <span className="sr-skills-col__title">
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--danger)" strokeWidth="2" width="12" height="12"><line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" /></svg>
              Need to learn
            </span>
            <div className="chip-list">
              {result.missingSkills?.map(s => (
                <span
                  className={`chip red sr-missing-chip${expandedSkill === s ? ' active' : ''}`}
                  key={s}
                  onClick={() => setExpandedSkill(expandedSkill === s ? null : s)}
                >
                  {s}
                  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" width="9" height="9" style={{ marginLeft: 3 }}>
                    <path d={expandedSkill === s ? 'M2 7L5 4l3 3' : 'M2 3l3 3 3-3'} />
                  </svg>
                </span>
              ))}
              {(!result.missingSkills || result.missingSkills.length === 0) && <span className="chip green">All skills matched!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Strengths & Weaknesses ──────────────────────────────────── */}
      <div className="card-grid" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>Strengths</h3>
          <div className="insight-list" style={{ marginTop: 12 }}>
            {result.strengths?.map(item => (
              <div className="insight-item strength" key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {item}
              </div>
            ))}
            {(!result.strengths || result.strengths.length === 0) && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No specific strengths highlighted.</p>}
          </div>
        </div>
        <div className="card">
          <h3>Areas to Improve</h3>
          <div className="insight-list" style={{ marginTop: 12 }}>
            {result.weaknesses?.map(item => (
              <div className="insight-item weakness" key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {item}
              </div>
            ))}
            {(!result.weaknesses || result.weaknesses.length === 0) && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No weak areas found.</p>}
          </div>
        </div>
      </div>

      {/* ── Skill Gap + YouTube Cards ───────────────────────────────── */}
      {result.missingSkills && result.missingSkills.length > 0 && (
        <div className="card sr-gap-section">
          <div className="sr-gap-header">
            <div>
              <h3>Skills Gap &amp; Learning Resources</h3>
              <p>Click any skill to reveal targeted YouTube resources</p>
            </div>
            <span className="badge danger">{missing} gap{missing !== 1 ? 's' : ''}</span>
          </div>
          <div className="sr-gap-grid">
            {result.missingSkills.map(skill => {
              const yt = findYtForSkill(result.youtubeRecommendations, skill)
              const isOpen = expandedSkill === skill
              return (
                <div
                  key={skill}
                  className={`sr-gap-card${isOpen ? ' expanded' : ''}`}
                  onClick={() => setExpandedSkill(isOpen ? null : skill)}
                >
                  <div className="sr-gap-card__top">
                    <span className="sr-gap-card__skill">
                      <svg viewBox="0 0 16 16" fill="none" stroke="var(--danger)" strokeWidth="2" width="12" height="12">
                        <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><circle cx="8" cy="11.5" r=".5" fill="var(--danger)" />
                      </svg>
                      {skill}
                    </span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </div>
                  {isOpen && (
                    <div className="sr-gap-card__body" onClick={e => e.stopPropagation()}>
                      {yt ? (
                        <>
                          <div className="sr-gap-yt">
                            <div className="sr-gap-yt__icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" /><path d="M9.545 15.568V8.432L15.818 12z" fill="white" /></svg>
                            </div>
                            <div>
                              <div className="sr-gap-yt__channel">{yt.channelName}</div>
                              <div className="sr-gap-yt__reason">{yt.reason}</div>
                            </div>
                          </div>
                          <a
                            className="button sm"
                            style={{ marginTop: 10, width: '100%', justifyContent: 'center', display: 'flex' }}
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(yt.searchQuery)}`}
                            target="_blank" rel="noreferrer"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            Watch on YouTube
                          </a>
                        </>
                      ) : (
                        <a
                          className="button sm secondary"
                          style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`}
                          target="_blank" rel="noreferrer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          Search YouTube for {skill}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Learning Journey CTA ─────────────────────────────────────── */}
      {result.learningPlan && result.learningPlan.length > 0 && !journeyOpen && (
        <div className="sr-journey-cta">
          <div className="sr-journey-cta__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
              <path d="M3 17l9-9 4 4 5-5" /><path d="M14 7h6v6" />
            </svg>
          </div>
          <div className="sr-journey-cta__text">
            <h3>Your Personalized 7-Day Learning Roadmap</h3>
            <p>We've mapped out exactly what to study, in what order, and for how long — to get you hired.</p>
          </div>
          <button className="button sr-journey-cta__btn" onClick={openJourney}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            Start Learning Journey
          </button>
        </div>
      )}

      {/* ── Full Learning Journey ─────────────────────────────────────── */}
      {journeyOpen && result.learningPlan && result.learningPlan.length > 0 && (
        <div className="sr-journey" ref={journeyRef}>
          <div className="sr-journey__header">
            <div>
              <h3>Your 7-Day Learning Journey</h3>
              <p>Follow this roadmap to close all skill gaps and become a top candidate</p>
            </div>
            <button className="button secondary sm" onClick={() => { setJourneyOpen(false); setExpandedDay(null) }}>
              Collapse
            </button>
          </div>

          <div className="sr-journey__stats">
            <div className="sr-journey__stat">
              <span className="sr-journey__stat-num">{result.learningPlan.length}</span>
              <span className="sr-journey__stat-lbl">Days</span>
            </div>
            <div className="sr-journey__stat">
              <span className="sr-journey__stat-num">{result.learningPlan.reduce((s, d) => s + (d.hours || 0), 0)}</span>
              <span className="sr-journey__stat-lbl">Total Hours</span>
            </div>
            <div className="sr-journey__stat">
              <span className="sr-journey__stat-num">{result.learningPlan.reduce((s, d) => s + (d.tasks?.length || 0), 0)}</span>
              <span className="sr-journey__stat-lbl">Tasks</span>
            </div>
            <div className="sr-journey__stat">
              <span className="sr-journey__stat-num">{missing}</span>
              <span className="sr-journey__stat-lbl">Skills to Bridge</span>
            </div>
          </div>

          <div className="sr-journey__days">
            {result.learningPlan.map((day, i) => {
              const isDayOpen = expandedDay === day.day
              const isHigh = day.priority?.toUpperCase() === 'HIGH'
              return (
                <div
                  key={day.day}
                  className={`sr-day${isHigh ? ' sr-day--high' : ' sr-day--medium'}${isDayOpen ? ' expanded' : ''}`}
                >
                  <div className="sr-day__header" onClick={() => setExpandedDay(isDayOpen ? null : day.day)}>
                    <div className="sr-day__num">{i + 1}</div>
                    <div className="sr-day__meta">
                      <span className="sr-day__topic">{day.topic}</span>
                      <div className="sr-day__badges">
                        <span className="chip" style={{ fontSize: '.7rem', padding: '2px 7px' }}>{day.hours}h</span>
                        <span className={`badge ${isHigh ? 'danger' : 'warning'}`} style={{ fontSize: '.68rem' }}>{day.priority}</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                      style={{ transform: isDayOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </div>
                  {isDayOpen && (
                    <div className="sr-day__body">
                      <ul className="sr-day__tasks">
                        {day.tasks?.map(task => (
                          <li key={task}>
                            <svg viewBox="0 0 14 14" fill="none" stroke="var(--success)" strokeWidth="2.5" width="11" height="11" style={{ flexShrink: 0 }}>
                              <path d="M2 7l3 3 7-6" />
                            </svg>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {result.youtubeRecommendations && result.youtubeRecommendations.length > 0 && (
            <div className="sr-journey__yt">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" style={{ flexShrink: 0 }}>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                  <path d="M9.545 15.568V8.432L15.818 12z" fill="white" />
                </svg>
                Recommended YouTube Channels
              </h4>
              <div className="sr-yt-grid">
                {result.youtubeRecommendations.map(item => (
                  <div className="sr-yt-card" key={item.skill}>
                    <div className="sr-yt-card__skill">{item.skill}</div>
                    <div className="sr-yt-card__channel">{item.channelName}</div>
                    <p className="sr-yt-card__reason">{item.reason}</p>
                    <a
                      className="button sm"
                      style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`}
                      target="_blank" rel="noreferrer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Eligible: YouTube as "Keep Improving" ───────────────────── */}
      {result.isEligible && result.youtubeRecommendations && result.youtubeRecommendations.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="section-header">
            <h3>Keep Improving</h3>
            <p>You're eligible — stay ahead with these resources.</p>
          </div>
          <div className="card-grid">
            {result.youtubeRecommendations.map(item => (
              <div className="yt-card" key={item.skill}>
                <div className="yt-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="yt-card__skill">{item.skill}</div>
                <div className="yt-card__channel">{item.channelName}</div>
                <p className="yt-card__reason">{item.reason}</p>
                <a
                  className="button sm"
                  style={{ marginTop: 12 }}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`}
                  target="_blank" rel="noreferrer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Watch on YouTube
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Back link ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link className="button secondary" to="/jobseeker/applications">
          ← Back to My Applications
        </Link>
      </div>
    </div>
  )
}

export default ScreeningResult


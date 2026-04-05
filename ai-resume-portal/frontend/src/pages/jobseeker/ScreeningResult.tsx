import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import applicationService from '../../services/applicationService'
import type { ScreeningResultResponse } from '../../types/screening'

const ScreeningResult = () => {
  const { applicationId } = useParams()
  const [result, setResult] = useState<ScreeningResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadResult = async () => {
      if (!applicationId) return
      try {
        setLoading(true)
        const data = await applicationService.getScreening(Number(applicationId))
        setResult(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load screening result.')
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [applicationId])

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading screening...</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="page center">
        <div className="card">No screening result found.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h3>Screening result</h3>
        <p>Match score</p>
        <div style={{ fontSize: '2.4rem', fontWeight: 700 }}>{result.matchScore ?? 0}%</div>
        <div className="badge" style={{ marginTop: '12px' }}>
          {result.isEligible ? 'Eligible' : 'Not eligible'}
        </div>
        {result.summary && <p style={{ marginTop: '16px' }}>{result.summary}</p>}
      </div>

      <div className="card-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3>Matched skills</h3>
          <div className="chip-list" style={{ marginTop: '12px' }}>
            {result.matchedSkills?.map((skill) => (
              <span className="chip" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Missing skills</h3>
          <div className="chip-list" style={{ marginTop: '12px' }}>
            {result.missingSkills?.map((skill) => (
              <span className="chip" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3>Strengths</h3>
          <ul style={{ marginTop: '12px', paddingLeft: '18px' }}>
            {result.strengths?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Weaknesses</h3>
          <ul style={{ marginTop: '12px', paddingLeft: '18px' }}>
            {result.weaknesses?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {result.learningPlan && result.learningPlan.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>7-day learning plan</h3>
          <div className="card-grid" style={{ marginTop: '16px' }}>
            {result.learningPlan.map((day) => (
              <div className="card" key={day.day}>
                <h3>{day.day}</h3>
                <p>{day.topic}</p>
                <ul style={{ marginTop: '12px', paddingLeft: '18px' }}>
                  {day.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.youtubeRecommendations && result.youtubeRecommendations.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>YouTube recommendations</h3>
          <div className="card-grid" style={{ marginTop: '16px' }}>
            {result.youtubeRecommendations.map((item) => (
              <div className="card" key={item.skill}>
                <h3>{item.skill}</h3>
                <p>{item.channelName}</p>
                <a
                  className="button secondary"
                  style={{ marginTop: '12px' }}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube
                </a>
                <p style={{ marginTop: '12px' }}>{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div style={{ color: '#b91c1c', marginTop: '24px' }}>{error}</div>}
    </div>
  )
}

export default ScreeningResult

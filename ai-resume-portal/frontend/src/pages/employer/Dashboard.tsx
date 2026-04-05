const EmployerDashboard = () => (
  <div className="page">
    <div className="card-grid">
      <div className="card">
        <h3>Active Job Posts</h3>
        <p>Keep listings fresh and highlight urgent roles.</p>
        <strong>12</strong>
      </div>
      <div className="card">
        <h3>Applicants Screened</h3>
        <p>AI summaries and match scores are ready.</p>
        <strong>38</strong>
      </div>
      <div className="card">
        <h3>Shortlist Rate</h3>
        <p>Pipeline conversion for this week.</p>
        <strong>42%</strong>
      </div>
    </div>
    <div className="card" style={{ marginTop: '24px' }}>
      <h3>Hiring Focus</h3>
      <p>Prioritize candidates with strong Spring Boot + MySQL depth.</p>
      <div className="chip-list" style={{ marginTop: '12px' }}>
        <span className="chip">Backend</span>
        <span className="chip">Security</span>
        <span className="chip">Database</span>
      </div>
    </div>
  </div>
)

export default EmployerDashboard

const AdminDashboard = () => (
  <div className="page">
    <div className="card-grid">
      <div className="card">
        <h3>Total Users</h3>
        <p>Active employers and seekers onboarded.</p>
        <strong>120</strong>
      </div>
      <div className="card">
        <h3>Open Jobs</h3>
        <p>Roles currently listed by employers.</p>
        <strong>38</strong>
      </div>
      <div className="card">
        <h3>AI Screens</h3>
        <p>Daily screenings and insights generated.</p>
        <strong>210</strong>
      </div>
    </div>
    <div className="card" style={{ marginTop: '24px' }}>
      <h3>Governance</h3>
      <p>Review flagged profiles and audit AI output quality.</p>
      <div className="chip-list" style={{ marginTop: '12px' }}>
        <span className="chip">Compliance</span>
        <span className="chip">Insights</span>
        <span className="chip">Trends</span>
      </div>
    </div>
  </div>
)

export default AdminDashboard

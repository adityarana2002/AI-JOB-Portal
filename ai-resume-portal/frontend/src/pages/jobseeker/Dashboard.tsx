const JobSeekerDashboard = () => (
  <div className="page">
    <div className="card-grid">
      <div className="card">
        <h3>Applications</h3>
        <p>Track your applied roles and AI results.</p>
        <strong>5</strong>
      </div>
      <div className="card">
        <h3>Match Highlights</h3>
        <p>Focus on roles with 70%+ match scores.</p>
        <strong>2</strong>
      </div>
      <div className="card">
        <h3>Learning Plans</h3>
        <p>Stay on top of recommended skill gaps.</p>
        <strong>3</strong>
      </div>
    </div>
    <div className="card" style={{ marginTop: '24px' }}>
      <h3>Next Actions</h3>
      <p>Review AI feedback and update your resume keywords.</p>
      <div className="chip-list" style={{ marginTop: '12px' }}>
        <span className="chip">Resume polish</span>
        <span className="chip">Practice</span>
        <span className="chip">Apply</span>
      </div>
    </div>
  </div>
)

export default JobSeekerDashboard

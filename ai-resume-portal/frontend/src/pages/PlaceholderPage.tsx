const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="page">
    <div className="card placeholder">
      <h3>{title}</h3>
      <p>This section is wired into routing and ready for Phase 9 content.</p>
      <div className="chip-list">
        <span className="chip">Design ready</span>
        <span className="chip">API ready</span>
        <span className="chip">Next phase</span>
      </div>
    </div>
  </div>
)

export default PlaceholderPage

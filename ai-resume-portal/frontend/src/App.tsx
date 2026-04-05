import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.status + ' - ' + data.phase)
      })
      .catch((err) => {
        setBackendStatus('Offline')
        console.error('Backend connection failed:', err)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>AI Resume Portal</h1>
      <p>Frontend: <strong>Running</strong></p>
      <p>Backend Status: <strong>{backendStatus}</strong></p>
    </div>
  )
}

export default App

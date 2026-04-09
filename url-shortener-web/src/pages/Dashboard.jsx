import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { isLoggedIn } = useAuth()
  const [apiOk, setApiOk] = useState(null)

  useEffect(() => {
    api.health().then(({ ok }) => setApiOk(ok))
  }, [])

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <p className="hint">
        Status:{' '}
        {apiOk === null && 'checking…'}
        {apiOk === true && <span style={{ color: 'var(--success)' }}>API reachable</span>}
        {apiOk === false && <span style={{ color: 'var(--error)' }}>API offline</span>}
      </p>
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Mode</div>
          <div className="kpi-value">{isLoggedIn ? 'Logged in' : 'Guest'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tracked QR</div>
          <div className="kpi-value">Free</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Direct QR</div>
          <div className="kpi-value">{isLoggedIn ? 'Available' : 'Login required'}</div>
        </div>
      </div>
      <p className="hint" style={{ marginTop: '1rem' }}>
        Use the left navigation to create short links, generate QR codes, and inspect analytics.
      </p>
    </section>
  )
}


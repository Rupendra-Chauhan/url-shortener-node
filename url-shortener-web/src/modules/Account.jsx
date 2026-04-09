import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

export default function Account() {
  const { token, user, isLoggedIn, login, logout } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpShown, setOtpShown] = useState(null)
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [msg, setMsg] = useState(null)
  const [reportMsg, setReportMsg] = useState(null)

  async function requestOtp(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setOtpShown(null)
    setLoading(true)
    try {
      const { ok, data } = await api.requestOtp(phone.trim())
      if (!ok) {
        setErr(data?.message || 'Failed')
        return
      }
      setOtpShown(data.otp)
      setMsg('OTP issued (demo mode — also shown below).')
    } catch {
      setErr('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      const { ok, data } = await api.verifyOtp(phone.trim(), otp.trim())
      if (!ok) {
        setErr(data?.message || 'Invalid OTP')
        return
      }
      login(data.token, data.user)
      setName(data.user?.name || '')
      setMsg('Logged in.')
      setOtpShown(null)
    } catch {
      setErr('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!token) return
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      const { ok, data } = await api.updateProfile(name.trim(), token)
      if (!ok) {
        setErr(data?.message || 'Failed')
        return
      }
      login(token, data.user)
      setMsg('Profile updated.')
    } catch {
      setErr('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function tryReport() {
    setReportMsg(null)
    try {
      const { ok, data, status } = await api.report(token)
      setReportMsg(
        ok
          ? `Unexpected success: ${JSON.stringify(data)}`
          : `${status}: ${data?.message || 'Forbidden'}`
      )
    } catch {
      setReportMsg('Network error')
    }
  }

  return (
    <section className="panel">
      <h2>Account</h2>

      {!isLoggedIn && (
        <>
          <p className="hint">Phone OTP login (demo API returns OTP in the response).</p>
          <form onSubmit={requestOtp}>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567"
                required
              />
            </div>
            <button type="submit" className="btn secondary" disabled={loading}>
              Request OTP
            </button>
          </form>
          {otpShown && (
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              <strong>OTP (demo):</strong> <code className="inline">{otpShown}</code>
            </p>
          )}
          <form onSubmit={verify} style={{ marginTop: '1.25rem' }}>
            <div className="field">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              Verify & log in
            </button>
          </form>
        </>
      )}

      {isLoggedIn && (
        <>
          <p className="hint">
            Signed in as <strong>{user?.phone}</strong>
          </p>
          <button type="button" className="btn secondary" onClick={logout} style={{ marginBottom: '1.25rem' }}>
            Log out
          </button>

          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Profile</h3>
          <form onSubmit={saveProfile}>
            <div className="field">
              <label htmlFor="name">Display name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              Save profile
            </button>
          </form>

          <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem' }}>Report API</h3>
          <p className="hint" style={{ marginBottom: '0.5rem' }}>
            Backend returns 403 for dashboard report — click to confirm.
          </p>
          <button type="button" className="btn secondary" onClick={tryReport}>
            Call GET /report/me
          </button>
          {reportMsg && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              {reportMsg}
            </p>
          )}
        </>
      )}

      {err && <div className="msg error">{err}</div>}
      {msg && <div className="msg success">{msg}</div>}
    </section>
  )
}

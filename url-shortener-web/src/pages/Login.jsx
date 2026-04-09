import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpShown, setOtpShown] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [msg, setMsg] = useState(null)

  const redirectTo = location.state?.from || '/app'

  async function requestOtp(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setOtpShown(null)
    setLoading(true)
    const { ok, data, status } = await api.requestOtp(phone.trim())
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Failed (${status})`)
      return
    }
    setOtpShown(data.otp)
    setMsg('OTP issued (demo mode — shown below).')
  }

  async function verify(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)
    const { ok, data, status } = await api.verifyOtp(phone.trim(), otp.trim())
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Invalid OTP (${status})`)
      return
    }
    login(data.token, data.user)
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">LS</div>
          <div>
            <div className="brand-title">LinkShort</div>
            <div className="brand-sub">OTP login</div>
          </div>
        </div>

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">
          Get a JWT to unlock <strong>direct QR</strong>, save links to your account, and view owned analytics.
        </p>

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
          <div className="msg success" style={{ marginTop: '0.9rem' }}>
            OTP (demo): <code className="inline">{otpShown}</code>
          </div>
        )}

        <form onSubmit={verify} style={{ marginTop: '1.1rem' }}>
          <div className="field">
            <label htmlFor="otp">OTP</label>
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
            Verify & continue
          </button>
        </form>

        {err && <div className="msg error">{err}</div>}
        {msg && <div className="msg success">{msg}</div>}

        <p className="auth-foot">
          Continue as <Link to="/app">guest</Link>.
        </p>
      </div>
    </div>
  )
}


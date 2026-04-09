import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

export default function Shorten() {
  const { token, isLoggedIn } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [result, setResult] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setResult(null)
    setLoading(true)
    try {
      const { ok, data, status } = await api.shorten(url.trim(), token)
      if (!ok) {
        setErr(data?.message || `Request failed (${status})`)
        return
      }
      setResult(data.data)
      setMsg('Short link created.')
    } catch {
      setErr('Network error — is the API running on port 4000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <h2>Shorten URL</h2>
      <p className="hint">
        Guests can create links (daily limit per IP).{' '}
        {isLoggedIn
          ? 'You are logged in — this link will be saved to your account.'
          : 'Log in to attach links to your account.'}
      </p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="long-url">Original URL</label>
          <input
            id="long-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com or www.example.com"
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating…' : 'Create short link'}
        </button>
      </form>
      {err && <div className="msg error">{err}</div>}
      {msg && <div className="msg success">{msg}</div>}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            Short URL
          </p>
          <a href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Code: <code className="inline">{result.code}</code> · Hits: {result.hits}
            {result.fromQr !== undefined && (
              <>
                {' '}
                · <span className="badge">fromQr: {String(result.fromQr)}</span>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  )
}

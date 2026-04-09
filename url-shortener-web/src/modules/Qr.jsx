import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api, postQrPng } from '../api/client'

export default function Qr() {
  const { token, isLoggedIn } = useAuth()
  const [url, setUrl] = useState('')
  const [tracked, setTracked] = useState(true)
  const [tab, setTab] = useState('tracked')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [preview, setPreview] = useState(null)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  async function generateTrackedJson(e) {
    e.preventDefault()
    setErr(null)
    setMeta(null)
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setLoading(true)
    const { ok, data, status } = await api.generateQr(
      { url: url.trim(), track: true },
      token
    )
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Request failed (${status})`)
      return
    }
    const d = data.data
    setMeta(d)
    if (d.qrDataUrl) setPreview(d.qrDataUrl)
  }

  async function generateTrackedPng(e) {
    e.preventDefault()
    setErr(null)
    setMeta(null)
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setLoading(true)
    const { ok, blob, data, status } = await postQrPng(
      '/api/v1/urls/qr',
      { url: url.trim(), track: true },
      token
    )
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Failed (${status})`)
      return
    }
    setPreview(URL.createObjectURL(blob))
  }

  async function generateUntracked(e) {
    e.preventDefault()
    if (!isLoggedIn) {
      setErr('Log in to encode the raw URL in the QR (or use tracked QR as a guest).')
      return
    }
    setErr(null)
    setMeta(null)
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setLoading(true)
    const { ok, data, status } = await api.generateQr(
      { url: url.trim(), track: false },
      token
    )
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Request failed (${status})`)
      return
    }
    const d = data.data
    setMeta(d)
    if (d.qrDataUrl) setPreview(d.qrDataUrl)
  }

  async function generateDirectPng(e) {
    e.preventDefault()
    if (!isLoggedIn) {
      setErr('Log in to use direct QR.')
      return
    }
    setErr(null)
    setMeta({ mode: 'direct' })
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setLoading(true)
    const { ok, blob, data, status } = await postQrPng(
      '/api/v1/urls/qr/direct',
      { url: url.trim() },
      token
    )
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Request failed (${status})`)
      return
    }
    setPreview(URL.createObjectURL(blob))
  }

  return (
    <section className="panel">
      <h2>QR codes</h2>
      <p className="hint">
        <strong>Tracked</strong> (default): QR opens your short link — hits are counted.{' '}
        <strong>Raw URL in QR</strong> / <strong>Direct</strong>: members only (JWT).
      </p>

      <div className="tabs-inner">
        <button
          type="button"
          className={tab === 'tracked' ? 'active' : ''}
          onClick={() => setTab('tracked')}
        >
          Tracked QR
        </button>
        <button
          type="button"
          className={tab === 'direct' ? 'active' : ''}
          onClick={() => setTab('direct')}
        >
          Direct QR
        </button>
      </div>

      <div className="field">
        <label htmlFor="qr-url">URL for QR</label>
        <input
          id="qr-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      {tab === 'tracked' && (
        <>
          <div className="checkbox-field">
            <input
              id="track"
              type="checkbox"
              checked={tracked}
              onChange={(e) => setTracked(e.target.checked)}
            />
            <label htmlFor="track">Tracked (create short link inside QR)</label>
          </div>
          <div className="row">
            {tracked ? (
              <>
                <button
                  type="button"
                  className="btn"
                  disabled={loading}
                  onClick={generateTrackedJson}
                >
                  Generate (preview)
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  disabled={loading}
                  onClick={generateTrackedPng}
                >
                  Load PNG preview
                </button>
              </>
            ) : (
              <button type="button" className="btn" disabled={loading} onClick={generateUntracked}>
                Generate raw URL QR (logged in)
              </button>
            )}
          </div>
        </>
      )}

      {tab === 'direct' && (
        <div className="row">
          <button
            type="button"
            className="btn"
            disabled={loading || !isLoggedIn}
            onClick={generateDirectPng}
          >
            Generate direct QR (PNG)
          </button>
          {!isLoggedIn && (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Sign in to use this option.
            </span>
          )}
        </div>
      )}

      {err && <div className="msg error">{err}</div>}

      {meta && meta.shortUrl && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Short link in QR:{' '}
          <a href={meta.shortUrl} target="_blank" rel="noreferrer">
            {meta.shortUrl}
          </a>
          {meta.code && (
            <>
              {' '}
              (<code className="inline">{meta.code}</code>)
            </>
          )}
        </p>
      )}

      {preview && (
        <div className="qr-preview">
          <img src={preview} alt="QR preview" />
        </div>
      )}
    </section>
  )
}

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

export default function MyData() {
  const { token, isLoggedIn } = useAuth()
  const [tab, setTab] = useState('urls')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [urls, setUrls] = useState([])
  const [qrList, setQrList] = useState([])
  const [pagination, setPagination] = useState(null)

  const loadUrls = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      const { ok, data } = await api.listUrls(token)
      if (!ok) {
        setErr(data?.message || 'Failed to load URLs')
        return
      }
      setUrls(data.data || [])
      setPagination(data.pagination)
    } catch {
      setErr('Network error')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isLoggedIn) loadUrls()
  }, [isLoggedIn, loadUrls])

  const loadQr = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      const { ok, data } = await api.listQrTracks(token)
      if (!ok) {
        setErr(data?.message || 'Failed to load QR list')
        return
      }
      setQrList(data.data || [])
      setPagination(data.pagination)
    } catch {
      setErr('Network error')
    } finally {
      setLoading(false)
    }
  }, [token])

  if (!isLoggedIn) {
    return (
      <section className="panel">
        <h2>My links</h2>
        <p className="hint">Log in to see URLs and tracked QR links you created.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>My links</h2>
      <p className="hint">All short URLs you own, and those created via tracked QR.</p>

      <div className="tabs-inner">
        <button
          type="button"
          className={tab === 'urls' ? 'active' : ''}
          onClick={() => {
            setTab('urls')
            loadUrls()
          }}
        >
          All short URLs
        </button>
        <button
          type="button"
          className={tab === 'qr' ? 'active' : ''}
          onClick={() => {
            setTab('qr')
            loadQr()
          }}
        >
          Tracked QR only
        </button>
      </div>

      <button type="button" className="btn secondary" onClick={tab === 'urls' ? loadUrls : loadQr}>
        {loading ? 'Loading…' : 'Refresh'}
      </button>

      {err && <div className="msg error">{err}</div>}

      {pagination && (
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
          Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
        </p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Original</th>
              <th>Hits</th>
              <th>QR?</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'urls' ? urls : qrList).map((row) => (
              <tr key={row.id}>
                <td>
                  <code className="inline">{row.code}</code>
                </td>
                <td>
                  <a href={row.originalUrl} target="_blank" rel="noreferrer">
                    {row.originalUrl.slice(0, 48)}
                    {row.originalUrl.length > 48 ? '…' : ''}
                  </a>
                </td>
                <td>{row.hits}</td>
                <td>
                  {row.fromQr ? <span className="badge qr">QR</span> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(tab === 'urls' ? urls : qrList).length === 0 && !loading && (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No items yet.</p>
        )}
      </div>
    </section>
  )
}

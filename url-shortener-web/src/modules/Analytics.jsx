import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

export default function Analytics() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (tab === 'qr') return items.filter((i) => i.fromQr)
    if (tab === 'shorten') return items.filter((i) => !i.fromQr)
    return items
  }, [items, tab])

  async function loadList() {
    setErr(null)
    setLoading(true)
    const [u, q] = await Promise.all([api.listUrls(token), api.listQrTracks(token)])
    setLoading(false)
    if (!u.ok) {
      setErr(u.data?.message || `Failed to load URLs (${u.status})`)
      return
    }
    if (!q.ok) {
      setErr(q.data?.message || `Failed to load QR list (${q.status})`)
      return
    }
    const map = new Map()
    for (const row of u.data.data || []) map.set(row.code, row)
    for (const row of q.data.data || []) map.set(row.code, row)
    setItems(Array.from(map.values()))
  }

  async function openAnalytics(row) {
    setErr(null)
    setSelected(row)
    setData(null)
    setLoading(true)
    const res = row.fromQr ? await api.qrAnalytics(row.code, token) : await api.urlAnalytics(row.code, token)
    setLoading(false)
    if (!res.ok) {
      setErr(res.data?.message || `Failed (${res.status})`)
      return
    }
    setData(res.data.data)
  }

  useEffect(() => {
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="panel">
      <h2>Analytics</h2>
      <p className="hint">Click a link to load its analytics immediately.</p>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="tabs-inner" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={tab === 'all' ? 'active' : ''}
            onClick={() => setTab('all')}
          >
            All
          </button>
          <button
            type="button"
            className={tab === 'shorten' ? 'active' : ''}
            onClick={() => setTab('shorten')}
          >
            Shorten only
          </button>
          <button
            type="button"
            className={tab === 'qr' ? 'active' : ''}
            onClick={() => setTab('qr')}
          >
            Tracked QR
          </button>
        </div>
        <button type="button" className="btn secondary" onClick={loadList} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Original</th>
              <th>Hits</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                style={{ cursor: 'pointer', background: selected?.code === row.code ? 'rgba(79,140,255,0.08)' : undefined }}
                onClick={() => openAnalytics(row)}
                title="Click to load analytics"
              >
                <td>
                  <code className="inline">{row.code}</code>
                </td>
                <td>
                  <span style={{ color: 'var(--text)' }}>
                    {row.originalUrl.slice(0, 52)}
                    {row.originalUrl.length > 52 ? '…' : ''}
                  </span>
                </td>
                <td>{row.hits}</td>
                <td>{row.fromQr ? <span className="badge qr">QR</span> : <span className="badge">shorten</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No items yet.</p>
        )}
      </div>

      {err && <div className="msg error">{err}</div>}
      {data && (
        <div style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
          <p>
            <strong>Short URL:</strong>{' '}
            <a href={data.shortUrl} target="_blank" rel="noreferrer">
              {data.shortUrl}
            </a>
          </p>
          <p>
            <strong>Original:</strong> {data.originalUrl}
          </p>
          <p>
            <strong>Hits:</strong> {data.hits}
          </p>
          {data.fromQr !== undefined && (
            <p>
              <strong>fromQr:</strong> {String(data.fromQr)}
            </p>
          )}
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Created {data.createdAt ? new Date(data.createdAt).toLocaleString() : '—'}
          </p>
        </div>
      )}
    </section>
  )
}

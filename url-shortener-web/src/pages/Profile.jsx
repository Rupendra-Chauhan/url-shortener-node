import { useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { token, user, login } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [msg, setMsg] = useState(null)

  async function save(e) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)
    const { ok, data, status } = await api.updateProfile(name.trim(), token)
    setLoading(false)
    if (!ok) {
      setErr(data?.message || `Failed (${status})`)
      return
    }
    login(token, data.user)
    setMsg('Profile updated.')
  }

  return (
    <section className="panel">
      <h2>Profile</h2>
      <p className="hint">
        Signed in as <strong>{user?.phone}</strong>
      </p>
      <form onSubmit={save}>
        <div className="field">
          <label htmlFor="name">Display name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
      {err && <div className="msg error">{err}</div>}
      {msg && <div className="msg success">{msg}</div>}
    </section>
  )
}


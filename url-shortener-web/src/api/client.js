const base = () =>
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function networkErrorMessage(path) {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    return `Network error calling ${apiUrl}${path}. If you're running the React dev server, remove VITE_API_URL to use the Vite proxy, or allow http://localhost:5173 in backend CORS.`
  }
  return `Network error calling ${path}. Is the backend running on http://localhost:4000 ?`
}

function headers({ json = true, token } = {}) {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function handle(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const data = await res.json()
    return { ok: res.ok, status: res.status, data }
  }
  if (ct.includes('image/png')) {
    const blob = await res.blob()
    return { ok: res.ok, status: res.status, blob }
  }
  const text = await res.text()
  return { ok: res.ok, status: res.status, text }
}

export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    jsonBody = true
  } = options
  const url = `${base()}${path}`
  const init = {
    method,
    headers: headers({ json: !!(body && jsonBody), token })
  }
  if (body && jsonBody) init.body = JSON.stringify(body)
  try {
    const res = await fetch(url, init)
    return handle(res)
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: networkErrorMessage(path) }
    }
  }
}

export const api = {
  health: () => request('/health'),

  requestOtp: (phone) =>
    request('/api/v1/auth/request-otp', { method: 'POST', body: { phone } }),

  verifyOtp: (phone, otp) =>
    request('/api/v1/auth/verify-otp', { method: 'POST', body: { phone, otp } }),

  updateProfile: (name, token) =>
    request('/api/v1/auth/profile', {
      method: 'PUT',
      body: { name },
      token
    }),

  shorten: (originalUrl, token) =>
    request('/api/v1/urls/shorten', {
      method: 'POST',
      body: { originalUrl },
      token: token || undefined
    }),

  generateQr: (payload, token) =>
    request('/api/v1/urls/qr', {
      method: 'POST',
      body: payload,
      token: token || undefined
    }),

  generateQrDirect: (url, token) =>
    request('/api/v1/urls/qr/direct', {
      method: 'POST',
      body: { url },
      token
    }),

  listUrls: (token, page = 1, limit = 20) =>
    request(`/api/v1/urls?page=${page}&limit=${limit}`, { token }),

  listQrTracks: (token, page = 1, limit = 20) =>
    request(`/api/v1/urls/qr/list?page=${page}&limit=${limit}`, { token }),

  urlAnalytics: (code, token) =>
    request(`/api/v1/urls/${encodeURIComponent(code)}`, {
      token: token || undefined
    }),

  qrAnalytics: (code, token) =>
    request(`/api/v1/urls/qr/${encodeURIComponent(code)}`, {
      token: token || undefined
    }),

  report: (token) =>
    request('/api/v1/report/me', { token: token || undefined })
}

/** POST JSON, expect PNG bytes (for QR preview download). */
export async function postQrPng(path, body, token) {
  const url = `${base()}${path}?format=png`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers({ json: true, token: token || undefined }),
      body: JSON.stringify(body)
    })
    return handle(res)
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: networkErrorMessage(path) }
    }
  }
}

const BASE = '/api'

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  let response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Network error — is the API server running on port 8000?')
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail ?? detail
    } catch { /* ignore */ }
    throw new Error(detail)
  }

  return response.json()
}

export const api = {
  get:  (path)       => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  // postForm: omit Content-Type so browser sets correct multipart boundary
  postForm: (path, formData) =>
    request(path, { method: 'POST', headers: {}, body: formData }),
}

const API_BASE = ''

export function getToken() {
  return localStorage.getItem('jashnsaz-token') || ''
}
export function setToken(t: string) {
  localStorage.setItem('jashnsaz-token', t)
}
export function clearToken() {
  localStorage.removeItem('jashnsaz-token')
}

async function req(path: string, opts: RequestInit = {}) {
  const token = getToken()
  const headers: any = {
    'Content-Type': 'application/json',
    ...(opts.headers||{})
  }
  if(token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {...opts, headers})
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.error || `خطا ${res.status}`)
  return data
}

// Auth
export const apiRegister = (payload: any) => req('/api/auth/register', {method:'POST', body: JSON.stringify(payload)})
export const apiLogin = (payload: any) => req('/api/auth/login', {method:'POST', body: JSON.stringify(payload)})
export const apiMe = () => req('/api/auth/me')
export const apiLogout = () => req('/api/auth/logout', {method:'POST'})

// Posts
export const apiGetPosts = (status='published') => req(`/api/posts?status=${status}`)
export const apiGetPost = (id: string) => req(`/api/posts/${id}`)
export const apiCreatePost = (payload: any) => req('/api/posts', {method:'POST', body: JSON.stringify(payload)})
export const apiUpdatePost = (id: string, payload: any) => req(`/api/posts/${id}`, {method:'PUT', body: JSON.stringify(payload)})
export const apiDeletePost = (id: string) => req(`/api/posts/${id}`, {method:'DELETE'})

// Leads
export const apiGetLeads = () => req('/api/leads')
export const apiCreateLead = (payload: any) => req('/api/leads', {method:'POST', body: JSON.stringify(payload)})
export const apiUpdateLead = (id: string, payload: any) => req(`/api/leads/${id}`, {method:'PATCH', body: JSON.stringify(payload)})
export const apiDeleteLead = (id: string) => req(`/api/leads/${id}`, {method:'DELETE'})

// Contact (old endpoint still works)
export const apiContact = (payload: any) => req('/api/contact', {method:'POST', body: JSON.stringify(payload)})

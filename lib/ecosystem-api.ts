'use client'

const BACKEND_URL = process.env.NEXT_PUBLIC_DJANGO_BACKEND_URL || 'https://school-ecosystem-demo.onrender.com'
// const BACKEND_URL = '/django-api'
// const BACKEND_URL = 'https://school-ecosystem-demo.onrender.com'

// Get subdomain from window.location in browser
function getSubdomain(): string {
  if (typeof window === 'undefined') return ''
  const host = window.location.hostname
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'xenocampus.com'
  const subdomain = host.replace(`.${appDomain}`, '')
  
  // In production — read from hostname
  if (subdomain !== host) return subdomain
  
  // In dev (localhost) — read from URL path /school/[subdomain]/...
  const pathMatch = window.location.pathname.match(/^\/school\/([^\/]+)/)
  return pathMatch ? pathMatch[1] : ''
}

// Core fetch wrapper — adds auth + subdomain headers automatically
async function ecosystemFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const access = localStorage.getItem('eco_access')
  const subdomain = getSubdomain()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (access) headers['Authorization'] = `Bearer ${access}`
  if (subdomain) headers['X-School-Subdomain'] = subdomain

  const res = await fetch(`${BACKEND_URL}/${path}`, {
    ...options,
    headers,
  })

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken(subdomain)
    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('eco_access')}`
      return fetch(`${BACKEND_URL}/${path}`, { ...options, headers })
    } else {
      // Refresh failed — redirect to ecosystem login
      window.location.href = '/login'
    }
  }

  return res
}

async function tryRefreshToken(subdomain: string): Promise<boolean> {
  const refresh = localStorage.getItem('eco_refresh')
  if (!refresh) return false

  try {
    const res = await fetch(`${BACKEND_URL}/accounts/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Subdomain': subdomain,
      },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) return false

    const data = await res.json()
    localStorage.setItem('eco_access', data.access)
    return true
  } catch {
    return false
  }
}

// ── Auth API ──────────────────────────────────────────

export interface LoginPayload {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'teacher' | 'admin'
  is_active: boolean
  is_email_verified: boolean
}

export const loginUser = async (data: LoginPayload) => {
  try {
    const res = await ecosystemFetch('accounts/api/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) return { success: false, message: json.detail || 'Invalid credentials' }
    localStorage.setItem('eco_access', json.access)
    localStorage.setItem('eco_refresh', json.refresh)
    return { success: true, data: json }
  } catch {
    return { success: false, message: 'Network error. Please try again.' }
  }
}

export const getUser = async () => {
  try {
    const res = await ecosystemFetch('accounts/api/user/')
    if (!res.ok) return { success: false, message: 'Session expired' }
    const data = await res.json()
    return { success: true, data: data as User }
  } catch {
    return { success: false, message: 'Failed to fetch user' }
  }
}

export const logoutUser = () => {
  const refresh = localStorage.getItem('eco_refresh')
  if (refresh) {
    ecosystemFetch('accounts/api/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }).catch(() => {})
  }
  localStorage.removeItem('eco_access')
  localStorage.removeItem('eco_refresh')
  localStorage.removeItem('eco_role')
}

export const isAuthenticated = () => {
  return !!(localStorage.getItem('eco_access') && localStorage.getItem('eco_refresh'))
}

// Generic API helpers for other modules to use
export const api = {
  get: (path: string) => ecosystemFetch(path),
  post: (path: string, body: any) => ecosystemFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: any) => ecosystemFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path: string, body: any) => ecosystemFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => ecosystemFetch(path, { method: 'DELETE' }),
}
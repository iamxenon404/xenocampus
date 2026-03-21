'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loginUser, getUser } from '@/lib/ecosystem-api'
import Link from 'next/link'

export default function EcosystemLoginPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const result = await loginUser(form)

    if (!result.success) {
      setError(result.message || 'Login failed')
      setLoading(false)
      return
    }

    // Get user role and redirect accordingly
    const userResult = await getUser()
    if (!userResult.success || !userResult.data) {
      setError('Failed to load user data')
      setLoading(false)
      return
    }

    const role = userResult.data.role
    localStorage.setItem('eco_role', role)

    switch (role) {
      case 'teacher':
        router.push(`/school/${subdomain}/teacher`)
        break
      case 'student':
        router.push(`/school/${subdomain}/student`)
        break
      case 'admin':
        router.push(`/school/${subdomain}/admin`)
        break
      default:
        setError('Unknown role')
    }

    setLoading(false)
  }

  // Get school branding from window
const [school, setSchool] = useState<any>(null)

useEffect(() => {
  setSchool((window as any).__SCHOOL__ || null)
}, [])
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">

        {/* School branding */}
        <div className="text-center mb-8">
          {school?.logo_url ? (
            <img src={school.logo_url} alt={school.name} className="h-12 mx-auto mb-3 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: school?.primary_color || '#4f46e5' }}>
              {school?.name?.charAt(0) || 'S'}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{school?.name || 'School Ecosystem'}</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': school?.primary_color || '#4f46e5' } as any}
              placeholder="Your username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !form.username || !form.password}
            className="w-full text-white py-3 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ backgroundColor: school?.primary_color || '#4f46e5' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
  Don't have an account?{' '}
  <Link href={`/school/${subdomain}/register`} className="text-gray-700 font-semibold hover:underline">
    Register
  </Link>
</p>

        <p className="text-center text-xs text-gray-400 mt-6">
          {school?.name} · Powered by xenoCampus
        </p>
      </div>
    </div>
  )
}
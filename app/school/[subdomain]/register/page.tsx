'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/ecosystem-api'

type Role = 'student' | 'teacher' | 'admin'

export default function EcosystemRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const [school, setSchool] = useState<any>(null)

  useEffect(() => {
    setSchool((window as any).__SCHOOL__ || null)
  }, [])

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student' as Role,
    school_code: '',
    registration_code: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
    if (error) setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const payload: any = { ...form }
      if (form.role === 'student') delete payload.registration_code

      const res = await api.post('accounts/api/register/', payload)
      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setFieldErrors(data.errors)
        if (data.detail) setError(data.detail)
        if (data.message) setError(data.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push(`/school/${subdomain}/login`), 1500)

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = school?.primary_color || '#4f46e5'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">

            {/* Left panel */}
            <div className="hidden md:flex md:w-1/3 p-10 flex-col justify-between text-white"
              style={{ backgroundColor: primaryColor }}>
              <div>
                {school?.logo_url ? (
                  <img src={school.logo_url} alt={school.name} className="h-10 mb-6 object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-6">
                    {school?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <h2 className="text-2xl font-bold leading-tight">{school?.name || 'School Ecosystem'}</h2>
                <p className="mt-4 text-white/70 text-sm leading-relaxed">
                  Create your account to access learning resources, classes, and more.
                </p>
              </div>
              <p className="text-xs font-medium opacity-50 uppercase tracking-widest">
                Powered by xenoCampus
              </p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-sm text-gray-400 mt-1">Fill in your details to register</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-100">
                  Account created! Redirecting to login...
                </div>
              )}

              <div className="space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First name</label>
                    <input name="first_name" placeholder="Jane" value={form.first_name} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last name</label>
                    <input name="last_name" placeholder="Doe" value={form.last_name} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  </div>
                </div>

                {/* Username & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                    <input name="username" placeholder="j_doe24" value={form.username} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input name="email" type="email" placeholder="j.doe@school.edu" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>

                {/* Password & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                    <select name="role" value={form.role} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                {/* School code & registration code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: primaryColor }}>
                      School Code
                    </label>
                    <input name="school_code" placeholder="e.g. ABC12345" value={form.school_code} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      style={{ borderColor: `${primaryColor}30` }} />
                    {fieldErrors.school_code && <p className="text-red-500 text-xs mt-1">{fieldErrors.school_code}</p>}
                  </div>
                  {form.role !== 'student' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: primaryColor }}>
                        {form.role === 'admin' ? 'Admin Code' : 'Teacher Code'}
                      </label>
                      <input name="registration_code" placeholder="Auth code" value={form.registration_code} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        style={{ borderColor: `${primaryColor}30` }} />
                      {fieldErrors.registration_code && <p className="text-red-500 text-xs mt-1">{fieldErrors.registration_code}</p>}
                    </div>
                  )}
                </div>

                <button onClick={handleSubmit} disabled={loading || success}
                  className="w-full text-white py-4 rounded-xl font-bold text-sm transition-opacity disabled:opacity-50 mt-2"
                  style={{ backgroundColor: primaryColor }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <Link href={`/school/${subdomain}/login`} className="font-semibold text-gray-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
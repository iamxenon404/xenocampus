'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const STEPS = ['Account', 'School', 'Plan', 'Confirm']

export default function SignupPage() {
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'starter'

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    adminName: '',
    email: '',
    password: '',
    schoolName: '',
    subdomain: '',
    plan: defaultPlan,
  })

  const update = (k: string, v: string) => {
    setError('')
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'schoolName') {
        next.subdomain = v.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        if (data.error?.toLowerCase().includes('subdomain')) setStep(1)
        if (data.error?.toLowerCase().includes('email')) setStep(0)
        return
      }

      window.location.href = '/dashboard/overview'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">

        <Link href="/" className="block text-center text-xl font-bold text-xeno-900 mb-8">
          xeno<span className="text-xeno-600">Campus</span>
        </Link>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? 'bg-xeno-600 text-white' :
                i === step ? 'bg-xeno-100 text-xeno-700 ring-2 ring-xeno-600' :
                'bg-gray-100 text-gray-400'
              }`}>{i < step ? '✓' : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-xeno-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Your name</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-xeno-500"
                placeholder="John Smith" value={form.adminName} onChange={e => update('adminName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email address</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-xeno-500"
                placeholder="admin@yourschool.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-xeno-500"
                placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <button onClick={() => setStep(1)} disabled={!form.adminName || !form.email || form.password.length < 8}
              className="w-full bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Continue
            </button>
          </div>
        )}

        {/* Step 1 — School */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Set up your school</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">School name</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-xeno-500"
                placeholder="Greenfield Academy" value={form.schoolName} onChange={e => update('schoolName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Your ecosystem URL</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-xeno-500">
                <input className="flex-1 px-4 py-3 text-sm focus:outline-none"
                  placeholder="greenfield" value={form.subdomain}
                  onChange={e => update('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20))} />
                <span className="bg-gray-50 px-3 py-3 text-sm text-gray-400 border-l border-gray-200">.xenocampus.com</span>
              </div>
              {form.subdomain && (
                <p className="text-xs text-xeno-600 mt-1">{form.subdomain}.xenocampus.com</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(2)} disabled={!form.schoolName || form.subdomain.length < 3}
                className="flex-1 bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose your plan</h2>
            {[
              { id: 'starter', name: 'Starter', price: '$150/mo', desc: 'Up to 300 students' },
              { id: 'growth', name: 'Growth', price: '$299/mo', desc: 'Up to 1,500 students', popular: true },
              { id: 'pro', name: 'Pro', price: '$499/mo', desc: 'Up to 5,000 students' },
            ].map(p => (
              <div key={p.id} onClick={() => update('plan', p.id)}
                className={`border rounded-xl p-4 cursor-pointer transition-colors relative ${
                  form.plan === p.id ? 'border-xeno-600 bg-xeno-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                {p.popular && <span className="absolute top-3 right-3 bg-xeno-100 text-xeno-700 text-xs px-2 py-0.5 rounded-full">Popular</span>}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{p.price}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Confirm details</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{form.adminName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{form.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">School</span>
                <span className="font-medium">{form.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">URL</span>
                <span className="font-medium text-xeno-600">{form.subdomain}.xenocampus.com</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-500">Plan</span>
                <span className="font-bold capitalize">{form.plan}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors disabled:opacity-50">
                {loading ? 'Creating...' : 'Create ecosystem →'}
              </button>
            </div>
          </div>
        )}

        {step < 3 && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account? <Link href="/login" className="text-xeno-600 hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
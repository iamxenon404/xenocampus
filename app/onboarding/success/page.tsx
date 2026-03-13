'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OnboardingSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'provisioning' | 'ready' | 'failed'>('provisioning')
  const [school, setSchool] = useState<{ subdomain: string; name: string } | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Poll every 3 seconds to check if provisioning is done
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/provision/status?session_id=${sessionId}`)
        const data = await res.json()

        if (data.status === 'active') {
          setSchool(data.school)
          setStatus('ready')
          clearInterval(interval)
        } else if (data.status === 'provision_failed') {
          setStatus('failed')
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-10 text-center">

        <p className="text-3xl font-bold text-xeno-900 mb-1">
          xeno<span className="text-xeno-600">Campus</span>
        </p>

        {status === 'provisioning' && (
          <>
            <div className="w-12 h-12 border-4 border-xeno-100 border-t-xeno-600 rounded-full animate-spin mx-auto mt-8 mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your ecosystem</h2>
            <p className="text-sm text-gray-400">We&apos;re building your school&apos;s platform. This takes about 30 seconds.</p>
          </>
        )}

        {status === 'ready' && school && (
          <>
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mt-8 mb-6 text-2xl">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your ecosystem is live!</h2>
            <p className="text-sm text-gray-400 mb-6">
              {school.name} is ready at:
            </p>
            <code className="block bg-xeno-50 text-xeno-700 px-4 py-3 rounded-xl text-sm mb-6">
              {school.subdomain}.xenocampus.com
            </code>
            <div className="space-y-3">
              <a href={`https://${school.subdomain}.xenocampus.com`}
                className="block w-full bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors">
                Open my ecosystem →
              </a>
              <button onClick={() => router.push('/dashboard/overview')}
                className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Go to dashboard
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mt-8 mb-6 text-2xl">✗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup failed</h2>
            <p className="text-sm text-gray-400 mb-6">
              Something went wrong provisioning your ecosystem. You have not been charged. Please contact support.
            </p>
            <a href="mailto:support@xenocampus.com"
              className="block w-full bg-xeno-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-xeno-700 transition-colors">
              Contact support
            </a>
          </>
        )}
      </div>
    </div>
  )
}

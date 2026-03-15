import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
import { PLANS } from '@/lib/stripe'

async function getSchool(schoolId: string) {
  const result = await query('SELECT * FROM schools WHERE id = $1', [schoolId])
  return result.rows[0] || null
}

export default async function DashboardPage() {
  // Auth check
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_school_token')?.value
  if (!token) redirect('/login')

const session = await verifyToken<{ schoolId: string; subdomain: string }>(token)
  if (!session) redirect('/login')

  const school = await getSchool(session.schoolId)
  if (!school) redirect('/login')

  const plan = PLANS[school.plan as keyof typeof PLANS]

  const studentPct = plan ? Math.round((school.student_count / plan.limits.students) * 100) : 0
  const storagePct = plan ? Math.round((school.cloud_storage_mb / 1024 / plan.limits.cloudStorageGB) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1">xenoCampus</p>
          <p className="font-semibold text-gray-900 text-sm truncate">{school.name}</p>
          <span className="inline-block mt-1 bg-xeno-50 text-xeno-700 text-xs px-2 py-0.5 rounded-full capitalize">{school.plan}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Overview', href: '/dashboard/overview', active: true },
            { label: 'Branding', href: '/dashboard/branding' },
            { label: 'Users', href: '/dashboard/users' },
            { label: 'Billing', href: '/dashboard/billing' },
            { label: 'Settings', href: '/dashboard/settings' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-xeno-50 text-xeno-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <a href={`https://${school.subdomain}.xenocampus.com`} target="_blank"
            className="block text-center text-xs bg-xeno-600 text-white px-3 py-2 rounded-lg hover:bg-xeno-700 transition-colors">
            Open ecosystem →
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
          <p className="text-gray-400 text-sm mb-8">Welcome back, {school.admin_name}</p>

          {/* Status banner if suspended */}
          {school.status === 'suspended' && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              Your account is suspended due to a failed payment.{' '}
              <a href="/dashboard/billing" className="underline font-medium">Update billing →</a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Students', value: school.student_count, limit: plan?.limits.students },
              { label: 'Staff', value: school.staff_count, limit: plan?.limits.staff === -1 ? '∞' : plan?.limits.staff },
              { label: 'Plan', value: school.plan, limit: null },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stat.value}</p>
                {stat.limit && typeof stat.limit === 'number' && (
                  <p className="text-xs text-gray-400 mt-1">of {stat.limit} max</p>
                )}
              </div>
            ))}
          </div>

          {/* Usage bars */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Usage</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Students</span>
                  <span className="text-gray-400">{school.student_count} / {plan?.limits.students}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full transition-all ${studentPct > 90 ? 'bg-red-500' : 'bg-xeno-600'}`}
                    style={{ width: `${Math.min(studentPct, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Cloud storage</span>
                  <span className="text-gray-400">{(school.cloud_storage_mb / 1024).toFixed(1)}GB / {plan?.limits.cloudStorageGB}GB</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full transition-all ${storagePct > 90 ? 'bg-red-500' : 'bg-xeno-600'}`}
                    style={{ width: `${Math.min(storagePct, 100)}%` }} />
                </div>
              </div>
            </div>
            {(studentPct > 80 || storagePct > 80) && (
              <p className="text-xs text-amber-600 mt-4">
                You&apos;re approaching your plan limits.{' '}
                <a href="/dashboard/billing" className="underline">Upgrade your plan →</a>
              </p>
            )}
          </div>

          {/* Ecosystem URL */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your ecosystem</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-50 text-xeno-700 text-sm px-4 py-3 rounded-xl">
                {school.custom_domain || `${school.subdomain}.xenocampus.com`}
              </code>
              <a href={`https://${school.custom_domain || `${school.subdomain}.xenocampus.com`}`}
                target="_blank"
                className="bg-xeno-600 text-white text-sm px-4 py-3 rounded-xl hover:bg-xeno-700 transition-colors whitespace-nowrap">
                Open →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

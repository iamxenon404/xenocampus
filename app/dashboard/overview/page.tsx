import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
import { PLANS } from '@/lib/stripe'

async function getSchool(schoolId: string) {
  const result = await query('SELECT * FROM schools WHERE id = $1', [schoolId])
  return result.rows[0] || null
}

export default async function OverviewPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_school_token')?.value
  if (!token) redirect('/login')

  const session = await verifyToken<{ schoolId: string }>(token)
  if (!session) redirect('/login')

  const school = await getSchool(session.schoolId)
  if (!school) redirect('/login')

  const plan = PLANS[school.plan as keyof typeof PLANS]
  const studentPct = plan ? Math.round((school.student_count / plan.limits.students) * 100) : 0
  const storagePct = plan ? Math.round((school.cloud_storage_mb / 1024 / plan.limits.cloudStorageGB) * 100) : 0

  return (
    <div className="max-w-4xl">

      <p className="text-gray-400 text-sm mb-8">Welcome back, {school.admin_name}</p>

      {/* Suspended banner */}
      {school.status === 'suspended' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          Your account is suspended due to a failed payment.{' '}
          <a href="/dashboard/billing" className="underline font-medium">Update billing →</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Students', value: school.student_count, sub: `of ${plan?.limits.students} max` },
          { label: 'Staff', value: school.staff_count, sub: plan?.limits.staff === -1 ? 'unlimited' : `of ${plan?.limits.staff} max` },
          { label: 'Plan', value: school.plan, sub: 'active', capitalize: true },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-gray-900 ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Usage */}
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
            Approaching plan limits.{' '}
            <a href="/dashboard/billing" className="underline">Upgrade →</a>
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
  )
}
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

async function getSchools() {
  const result = await query(`
    SELECT id, name, subdomain, plan, status, student_count, staff_count,
           cloud_storage_mb, created_at, last_active, stripe_customer_id
    FROM schools
    ORDER BY created_at DESC
  `)
  return result.rows
}

const STATUS_COLORS: Record<string, string> = {
  active:           'bg-green-50 text-green-700',
  suspended:        'bg-red-50 text-red-700',
  cancelled:        'bg-gray-100 text-gray-500',
  pending:          'bg-yellow-50 text-yellow-700',
  provisioning:     'bg-blue-50 text-blue-700',
  provision_failed: 'bg-red-50 text-red-700',
}

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_admin_token')?.value
  if (!token) redirect('/admin/login')

  const session = verifyToken<{ adminId: string }>(token)
  if (!session) redirect('/admin/login')

  const schools = await getSchools()

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    suspended: schools.filter(s => s.status === 'suspended').length,
    totalStudents: schools.reduce((acc, s) => acc + (s.student_count || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-xeno-900">xeno<span className="text-xeno-600">Campus</span></span>
          <span className="ml-3 text-sm text-gray-400">Admin</span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
        </form>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Schools</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total schools', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Suspended', value: stats.suspended },
            { label: 'Total students', value: stats.totalStudents },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Schools table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['School', 'Plan', 'Status', 'Students', 'Storage', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schools.map(school => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{school.name}</p>
                    <p className="text-xs text-gray-400">{school.subdomain}.xenocampus.com</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="capitalize text-gray-600">{school.plan}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[school.status] || 'bg-gray-100 text-gray-500'}`}>
                      {school.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{school.student_count || 0}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {((school.cloud_storage_mb || 0) / 1024).toFixed(1)}GB
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(school.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/schools/${school.id}`}
                        className="text-xs text-xeno-600 hover:underline">View</a>
                      {school.status === 'active' && (
                        <button className="text-xs text-red-500 hover:underline">Suspend</button>
                      )}
                      {school.status === 'suspended' && (
                        <button className="text-xs text-green-600 hover:underline">Unsuspend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No schools yet. Share your link and get your first customer!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

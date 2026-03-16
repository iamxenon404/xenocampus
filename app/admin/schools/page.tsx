import { query } from '@/lib/db'

async function getSchools() {
  const result = await query(`
    SELECT id, name, subdomain, plan, status, student_count,
           cloud_storage_mb, created_at, last_active
    FROM schools
    ORDER BY created_at DESC
  `)
  return result.rows
}

const STATUS_COLORS: Record<string, string> = {
  active:           'bg-green-950 text-green-400',
  suspended:        'bg-red-950 text-red-400',
  cancelled:        'bg-gray-800 text-gray-500',
  pending:          'bg-yellow-950 text-yellow-400',
  provisioning:     'bg-blue-950 text-blue-400',
  provision_failed: 'bg-red-950 text-red-400',
}

export default async function SchoolsPage() {
  const schools = await getSchools()

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    suspended: schools.filter(s => s.status === 'suspended').length,
    totalStudents: schools.reduce((acc, s) => acc + (s.student_count || 0), 0),
  }

  return (
    <div className="max-w-6xl">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total schools', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Suspended', value: stats.suspended },
          { label: 'Total students', value: stats.totalStudents },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {['School', 'Plan', 'Status', 'Students', 'Storage', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {schools.map(school => (
              <tr key={school.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{school.name}</p>
                  <p className="text-xs text-gray-500">{school.subdomain}.xenocampus.com</p>
                </td>
                <td className="px-5 py-4">
                  <span className="capitalize text-gray-300">{school.plan}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[school.status] || 'bg-gray-800 text-gray-500'}`}>
                    {school.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-300">{school.student_count || 0}</td>
                <td className="px-5 py-4 text-gray-300">
                  {((school.cloud_storage_mb || 0) / 1024).toFixed(1)}GB
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {new Date(school.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <a href={`/admin/schools/${school.id}`} className="text-xs text-xeno-500 hover:underline">
                      View
                    </a>
                    {school.status === 'active' && (
                      <button className="text-xs text-red-400 hover:underline">Suspend</button>
                    )}
                    {school.status === 'suspended' && (
                      <button className="text-xs text-green-400 hover:underline">Unsuspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-gray-600 text-sm">
                  No schools yet. Share your site and get your first customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
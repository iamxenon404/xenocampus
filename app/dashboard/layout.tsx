import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
// import DashboardSidebar from '@/components/dashboard/Sidebar'
// import DashboardHeader from '@/components/dashboard/Header'
import DashboardSidebar from './Sidebar'
import DashboardHeader from './Header'

async function getSchool(schoolId: string) {
  const result = await query('SELECT * FROM schools WHERE id = $1', [schoolId])
  return result.rows[0] || null
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_school_token')?.value
  if (!token) redirect('/login')

  const session = await verifyToken<{ schoolId: string; subdomain: string }>(token)
  if (!session) redirect('/login')

  const school = await getSchool(session.schoolId)
  if (!school) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar school={school} />
      <div className="flex-1 flex flex-col ml-56">
        <DashboardHeader school={school} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
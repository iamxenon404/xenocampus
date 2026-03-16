import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
// import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from './components/Header'
import AdminSidebar from './components/Sidebar'
// import AdminHeader from '@/components/admin/Header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_admin_token')?.value
  if (!token) redirect('/admin/login')

  const session = await verifyToken<{ adminId: string; email: string; name: string }>(token)
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar admin={session} />
      <div className="flex-1 flex flex-col ml-56">
        <AdminHeader admin={session} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
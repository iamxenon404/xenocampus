'use client'
import EcoAuthProvider, { useEcoAuth } from '@/components/ecosystem/EcoAuthProvider'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '' },
  { label: 'Users', href: '/users' },
  { label: 'Classes', href: '/classes' },
  { label: 'Resources', href: '/resources' },
  { label: 'Events', href: '/events' },
  { label: 'Communication', href: '/communication' },
]

function AdminSidebar() {
  const { user, logout } = useEcoAuth()
  const params = useParams()
  const pathname = usePathname()
  const subdomain = params.subdomain as string
  const school = typeof window !== 'undefined' ? (window as any).__SCHOOL__ : null
  const base = `/school/${subdomain}/admin`

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col z-10">
      <div className="p-5 border-b border-gray-100">
        {school?.logo_url ? (
          <img src={school.logo_url} alt={school.name} className="h-8 mb-2 object-contain" />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-2"
            style={{ backgroundColor: school?.primary_color || '#4f46e5' }}>
            {school?.name?.charAt(0) || 'S'}
          </div>
        )}
        <p className="font-semibold text-gray-900 text-sm truncate">{school?.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const href = `${base}${item.href}`
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? 'text-white font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={active ? { backgroundColor: school?.primary_color || '#4f46e5' } : {}}>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-700">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button onClick={logout}
          className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <EcoAuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 ml-56 p-8">
          {children}
        </main>
      </div>
    </EcoAuthProvider>
  )
}
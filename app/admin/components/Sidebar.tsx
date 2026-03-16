'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Schools',
    href: '/admin/schools',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>
    )
  },
]

interface Props {
  admin: { email: string; name?: string }
}

export default function AdminSidebar({ admin }: Props) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">

      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <p className="font-bold text-white">
          xeno<span className="text-xeno-500">Campus</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className={active ? 'text-xeno-500' : 'text-gray-500'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-gray-300">{admin.name || 'Admin'}</p>
          <p className="text-xs text-gray-500 truncate">{admin.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/admin/schools': 'Schools',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

interface Props {
  admin: { name?: string; email: string }
}

export default function AdminHeader({ admin }: Props) {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] || 'Admin'

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 px-8 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-400">{admin.name || admin.email}</p>
        <div className="w-8 h-8 rounded-full bg-xeno-900 border border-xeno-700 flex items-center justify-center text-xeno-400 text-sm font-semibold">
          {(admin.name || admin.email).charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
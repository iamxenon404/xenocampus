'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/users': 'Users',
  '/dashboard/branding': 'Branding',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
}

interface Props {
  school: {
    admin_name: string
    name: string
  }
}

export default function DashboardHeader({ school }: Props) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{school.admin_name}</p>
          <p className="text-xs text-gray-400">{school.name}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-xeno-100 flex items-center justify-center text-xeno-700 text-sm font-semibold">
          {school.admin_name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/ecosystem-api'

export default function SchoolRootPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string

  useEffect(() => {
    if (isAuthenticated()) {
      const role = localStorage.getItem('eco_role')
      switch (role) {
        case 'teacher':
          router.replace(`/school/${subdomain}/teacher`)
          break
        case 'student':
          router.replace(`/school/${subdomain}/student`)
          break
        case 'admin':
          router.replace(`/school/${subdomain}/admin`)
          break
        default:
          router.replace(`/school/${subdomain}/login`)
      }
    } else {
      router.replace(`/school/${subdomain}/login`)
    }
  }, [subdomain, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )
}
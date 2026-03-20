'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getUser, logoutUser, type User } from '@/lib/ecosystem-api'

interface EcoAuthContextType {
  user: User | null
  role: string
  loading: boolean
  logout: () => void
}

const EcoAuthContext = createContext<EcoAuthContextType>({
  user: null,
  role: '',
  loading: true,
  logout: () => {},
})

export const useEcoAuth = () => useContext(EcoAuthContext)

export default function EcoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string

  useEffect(() => {
    const init = async () => {
      const access = localStorage.getItem('eco_access')
      if (!access) {
        router.replace(`/school/${subdomain}/login`)
        setLoading(false)
        return
      }

      const result = await getUser()
      if (!result.success || !result.data) {
        logoutUser()
        router.replace(`/school/${subdomain}/login`)
        setLoading(false)
        return
      }

      setUser(result.data)
      setRole(result.data.role)
      localStorage.setItem('eco_role', result.data.role)
      setLoading(false)
    }

    init()
  }, [])

  const logout = () => {
    logoutUser()
    router.replace(`/school/${subdomain}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <EcoAuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </EcoAuthContext.Provider>
  )
}
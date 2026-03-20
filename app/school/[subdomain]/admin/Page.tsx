'use client'
import { useEffect, useState } from 'react'
import { useEcoAuth } from '@/components/ecosystem/EcoAuthProvider'
import { api } from '@/lib/ecosystem-api'

export default function AdminDashboardPage() {
  const { user } = useEcoAuth()
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, resources: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('adminpanel/api/stats/')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // stats stay at 0
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Welcome back, {user?.first_name || user?.username}</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Students', value: stats.students },
          { label: 'Teachers', value: stats.teachers },
          { label: 'Classes', value: stats.classes },
          { label: 'Resources', value: stats.resources },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EL'

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Executive Ledger</h2>

        <div className="flex items-center space-x-4">
          {mounted && user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                user.role === 'admin' ? 'bg-purple-600' : 'bg-primary-600'
              }`}>
                {initials}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

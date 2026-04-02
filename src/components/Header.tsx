'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Calendar, X } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Outside click se modal band karo
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    if (showProfile) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showProfile])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EL'

  const handleLogout = async () => {
    setShowProfile(false)
    await logout()
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Executive Ledger</h2>

        <div className="flex items-center space-x-4 relative" ref={modalRef}>
          {mounted && user && (
            <>
              <button
                onClick={() => setShowProfile(p => !p)}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer ${
                  user.role === 'admin' ? 'bg-purple-600' : 'bg-primary-600'
                }`}>
                  {initials}
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  {/* Header */}
                  <div className={`p-5 rounded-t-xl ${user.role === 'admin' ? 'bg-purple-600' : 'bg-primary-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-lg">
                          {initials}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.full_name}</p>
                          <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-full capitalize">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setShowProfile(false)} className="text-white hover:text-gray-200">
                        <X className="h-4 w-4" suppressHydrationWarning />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                      <span className="capitalize">{user.role === 'admin' ? 'Administrator' : 'Sales Representative'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                      <span>ID: {user.id?.slice(0, 8)}...</span>
                    </div>
                    {user.created_at && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

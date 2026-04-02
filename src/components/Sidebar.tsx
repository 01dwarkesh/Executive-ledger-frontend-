'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LayoutDashboard, Users, FileText, Package, ClipboardList, Lock, LogOut } from 'lucide-react'

function getStoredRole(): string {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return ''
    return JSON.parse(userStr)?.role || ''
  } catch { return '' }
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  // localStorage se seedha role lo — async useAuth ka wait nahi
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    setRole(getStoredRole())
  }, [])

  // jab useAuth se user aaye tab bhi update karo
  useEffect(() => {
    if (user?.role) setRole(user.role)
  }, [user?.role])

  const adminMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Activity Log', href: '/activity', icon: ClipboardList },
    { name: 'Users', href: '/users', icon: Lock },
  ]

  const salesMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Clients', href: '/clients', icon: Users },
    { name: 'My Quotes', href: '/quotes', icon: FileText },
    { name: 'Products', href: '/products', icon: Package },
  ]

  const menuItems = role === 'admin' ? adminMenuItems : salesMenuItems

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const displayUser = user || (() => {
    try {
      const s = localStorage.getItem('user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })()

  return (
    <div className="w-64 bg-primary-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">EL</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Executive Ledger</h1>
            <p className="text-xs text-gray-500 capitalize" suppressHydrationWarning>{role || 'Loading...'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`sidebar-item w-full text-left ${isActive(item.href) ? 'active' : ''}`}
              suppressHydrationWarning
            >
              <item.icon className="mr-3 h-5 w-5" suppressHydrationWarning />
              {item.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="px-4 pb-6 border-t border-gray-200 pt-4">
        {displayUser && (
          <div className="mb-3 px-3 py-2 bg-white rounded-lg" suppressHydrationWarning>
            <p className="text-sm font-medium text-gray-900 truncate">{displayUser.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" suppressHydrationWarning />
          Sign Out
        </button>
      </div>
    </div>
  )
}

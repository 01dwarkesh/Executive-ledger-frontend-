'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Mail, Shield, Calendar, X, Pencil, KeyRound, Check } from 'lucide-react'
import { authService } from '@/services/auth'

export default function Header() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowProfile(false)
        setEditingName(false)
        setEditingPassword(false)
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

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await authService.updateProfile({ full_name: newName.trim() })
      await refreshUser()
      setEditingName(false)
      setSuccessMsg('Name updated!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(newPassword)
      setEditingPassword(false)
      setNewPassword('')
      setSuccessMsg('Password changed!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Executive Ledger</h2>

        <div className="flex items-center space-x-4 relative" ref={modalRef}>
          {mounted && user && (
            <>
              <button
                onClick={() => { setShowProfile(p => !p); setEditingName(false); setEditingPassword(false) }}
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

                  <div className="p-4 space-y-3">
                    {successMsg && (
                      <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                        <Check className="h-4 w-4" suppressHydrationWarning /> {successMsg}
                      </div>
                    )}

                    {/* Email */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                      <span>{user.role === 'admin' ? 'Administrator' : 'Sales Representative'}</span>
                    </div>

                    {/* Join date */}
                    {user.created_at && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" suppressHydrationWarning />
                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 space-y-2">
                      {/* Edit Name */}
                      {editingName ? (
                        <div className="space-y-2">
                          <input
                            autoFocus
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                            placeholder="New name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                          />
                          <div className="flex gap-2">
                            <button onClick={handleSaveName} disabled={saving} className="flex-1 py-1.5 bg-primary-600 text-white rounded-md text-xs font-medium">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingName(false)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingName(true); setEditingPassword(false); setNewName(user.full_name || '') }}
                          className="w-full flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4 text-gray-400" suppressHydrationWarning /> Edit Name
                        </button>
                      )}

                      {/* Change Password */}
                      {editingPassword ? (
                        <div className="space-y-2">
                          <input
                            autoFocus
                            type="password"
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSavePassword()}
                          />
                          <div className="flex gap-2">
                            <button onClick={handleSavePassword} disabled={saving} className="flex-1 py-1.5 bg-primary-600 text-white rounded-md text-xs font-medium">
                              {saving ? 'Saving...' : 'Change'}
                            </button>
                            <button onClick={() => setEditingPassword(false)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingPassword(true); setEditingName(false); setNewPassword('') }}
                          className="w-full flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <KeyRound className="h-4 w-4 text-gray-400" suppressHydrationWarning /> Change Password
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sign Out */}
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

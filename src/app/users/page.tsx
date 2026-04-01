'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { User, UserCreate, UserUpdate } from '@/types'
import { Plus } from 'lucide-react'

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showResetModal, setShowResetModal] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UserCreate>({ email: '', password: '', full_name: '', role: 'sales' })

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) { router.push('/login'); return }
    // Redirect non-admins
    if (currentUser && currentUser.role !== 'admin') { router.push('/dashboard'); return }
    fetchUsers()
  }, [router, currentUser])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditUser(null)
    setForm({ email: '', password: '', full_name: '', role: 'sales' })
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ email: u.email, password: '', full_name: u.full_name, role: u.role })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editUser) {
        const update: UserUpdate = { full_name: form.full_name, role: form.role }
        await authService.updateUser(editUser.id, update)
      } else {
        await authService.createUser(form)
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u: User) => {
    const action = u.is_active ? 'deactivate' : 'reactivate'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${u.full_name}?`)) return
    try {
      if (u.is_active) {
        await authService.deactivateUser(u.id)
      } else {
        await authService.reactivateUser(u.id)
      }
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action}`)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showResetModal) return
    setSaving(true)
    try {
      await authService.resetPassword(showResetModal.id, newPassword)
      setShowResetModal(null)
      setNewPassword('')
      alert('Password reset successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setSaving(false)
    }
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const salesCount = users.filter(u => u.role === 'sales').length
  const activeCount = users.filter(u => u.is_active).length

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage team members and their access levels.</p>
          </div>

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
                <p className="text-sm text-gray-500">Admins</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-blue-600">{salesCount}</p>
                <p className="text-sm text-gray-500">Sales Users</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">{activeCount} active users</span>
            <button className="btn-primary" onClick={openCreate}>
              <Plus className="inline mr-2 h-4 w-4" /> Add User
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                          u.role === 'admin' ? 'bg-purple-600' : 'bg-primary-600'
                        }`}>
                          {u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-primary-600 hover:text-primary-900" onClick={() => openEdit(u)}>Edit</button>
                        <button className="text-gray-500 hover:text-gray-900" onClick={() => { setShowResetModal(u); setNewPassword('') }}>Reset PW</button>
                        {u.id !== currentUser?.id && (
                          <button
                            className={u.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" disabled={!!editUser} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input required type="password" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'sales' }))}>
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">For: {showResetModal.full_name}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input required type="password" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setShowResetModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Resetting...' : 'Reset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { clientsService } from '@/services/clients'
import { Client, ClientCreate } from '@/types'
import { Plus } from 'lucide-react'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [form, setForm] = useState<ClientCreate>({ company_name: '', contact_name: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('authToken')) { router.push('/login'); return }
    fetchClients()
  }, [router])

  const fetchClients = async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientsService.getClients(0, 50, q)
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchClients(search || undefined)
  }

  const openCreate = () => {
    setEditClient(null)
    setForm({ company_name: '', contact_name: '', email: '' })
    setShowModal(true)
  }

  const openEdit = (client: Client) => {
    setEditClient(client)
    setForm({ company_name: client.company_name, contact_name: client.contact_name, email: client.email, phone: client.phone || '', notes: client.notes || '', tier: client.tier || '', industry: client.industry || '' })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editClient) {
        await clientsService.updateClient(editClient.id, form)
      } else {
        await clientsService.createClient(form)
      }
      setShowModal(false)
      fetchClients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Delete this client?')) return
    try {
      await clientsService.deleteClient(clientId)
      fetchClients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client portfolio.</p>
          </div>

          <div className="flex items-center justify-between mb-6 gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by company or contact..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
              />
              <button type="submit" className="btn-secondary">Search</button>
            </form>
            <button className="btn-primary" onClick={openCreate}><Plus className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Add Client</button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COMPANY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PHONE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIER</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No clients found</td></tr>
                  ) : clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.contact_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.phone || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.tier || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => openEdit(client)}>Edit</button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(client.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-700">
              {clients.length} client{clients.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={e => { if(e.target === e.currentTarget) { const setters = [setShowModal]; setters.forEach(s => { try { s(false) } catch{} }) } }}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editClient ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.tier || ''} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.industry || ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

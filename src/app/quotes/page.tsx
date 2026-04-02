'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { quotesService } from '@/services/quotes'
import { clientsService } from '@/services/clients'
import { QuoteListOut, Client, QuoteCreate } from '@/types'
import { Plus, Trash2, Eye } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  changes_requested: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function QuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<QuoteListOut[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newQuoteClientId, setNewQuoteClientId] = useState('')
  const [newQuoteCurrency, setNewQuoteCurrency] = useState('INR')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) { router.push('/login'); return }
    fetchQuotes()
    clientsService.getClients(0, 200).then(setClients).catch(() => {})
  }, [router])

  const fetchQuotes = async (status?: string, clientId?: string, q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await quotesService.getQuotes(0, 50, status || undefined, clientId || undefined, q || undefined)
      setQuotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => fetchQuotes(statusFilter, clientFilter, search)

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuoteClientId) return
    setCreating(true)
    try {
      const quote = await quotesService.createQuote({ client_id: newQuoteClientId, currency: newQuoteCurrency })
      router.push(`/quotes/${quote.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create quote')
      setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation()
    if (!confirm('Delete this quote?')) return
    try {
      await quotesService.deleteQuote(quoteId)
      fetchQuotes(statusFilter, clientFilter, search)
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
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <p className="text-gray-600 mt-1">Manage and track all client quotes.</p>
          </div>

          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
                <option value="">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button className="btn-secondary" onClick={applyFilters}>Apply</button>
            </div>
            <button className="btn-primary" onClick={() => setShowNewModal(true)}><Plus className="inline mr-2 h-4 w-4" suppressHydrationWarning /> New Quote</button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUOTE #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VERSION</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CURRENCY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : quotes.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No quotes found</td></tr>
                  ) : quotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quote_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quote.client?.company_name || '—'}</div>
                        <div className="text-sm text-gray-500">{quote.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">v{quote.version}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-800'}`}>
                          {quote.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={e => e.stopPropagation()}>
                        <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => router.push(`/quotes/${quote.id}`)}><Eye className="inline h-4 w-4" suppressHydrationWarning /> View</button>
                        <button className="text-red-600 hover:text-red-900" onClick={e => handleDelete(e, quote.id)}><Trash2 className="inline h-4 w-4" suppressHydrationWarning /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-700">
              {quotes.length} quote{quotes.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </main>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Quote</h2>
            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client *</label>
                <select required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={newQuoteClientId} onChange={e => setNewQuoteClientId(e.target.value)}>
                  <option value="">— Choose a client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={newQuoteCurrency} onChange={e => setNewQuoteCurrency(e.target.value)}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

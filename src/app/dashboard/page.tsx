'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { dashboardService } from '@/services/dashboard'
import { quotesService } from '@/services/quotes'
import { DashboardStats, QuoteListOut } from '@/types'
import { Search, Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  changes_requested: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentQuotes, setRecentQuotes] = useState<QuoteListOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/login')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [statsData, quotesData] = await Promise.all([
        dashboardService.getDashboardStats(),
        quotesService.getQuotes(0, 5),
      ])
      setStats(statsData)
      setRecentQuotes(quotesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const rowClickHandler = (quoteId: any) => {
    router.push(`/quotes/${quoteId}`)
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Sales Overview</h1>
              <p className="text-gray-600 mt-1">Live performance metrics</p>
            </div>

            <div className="flex space-x-4 mb-6">
              <button className="btn-secondary"><Search className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Filter</button>
              <button className="btn-primary" onClick={() => router.push('/quotes')}><Plus className="inline mr-2 h-4 w-4" suppressHydrationWarning /> New Quote</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total_value}</div>
                  <div className="text-sm text-gray-600">{stats.total_active} Active Quotes</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Approval</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pending_approval}</div>
                  <div className="text-sm text-gray-600">Awaiting client review</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Approved</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stats.approved}</div>
                  <div className="text-sm text-gray-600">{stats.drafts} Drafts · {stats.rejected} Rejected</div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
                <button onClick={() => router.push('/quotes')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUOTE #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CURRENCY</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentQuotes.length === 0 && !loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No quotes found</td></tr>
                    ) : recentQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => rowClickHandler(quote.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quote.client?.company_name || '—'}</div>
                          <div className="text-sm text-gray-500">{quote.client?.contact_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quote.quote_number} <span className="text-gray-400">v{quote.version}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.currency}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-800'}`}>
                            {quote.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

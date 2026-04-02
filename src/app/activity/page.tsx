'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { quotesService } from '@/services/quotes'
import { ActivityLog, QuoteListOut } from '@/types'
import { FileText, Mail, Eye, CheckCircle, XCircle, RotateCcw, Copy, Pencil, Pin, RefreshCw } from 'lucide-react'

const EVENT_ICON_MAP: Record<string, React.ElementType> = {
  quote_created: FileText,
  quote_sent: Mail,
  client_opened: Eye,
  client_approved: CheckCircle,
  client_rejected: XCircle,
  client_changes_requested: RotateCcw,
  version_created: Copy,
  updated: Pencil,
}

const EVENT_COLORS: Record<string, string> = {
  quote_created: 'bg-blue-100 text-blue-700',
  quote_sent: 'bg-indigo-100 text-indigo-700',
  client_opened: 'bg-gray-100 text-gray-700',
  client_approved: 'bg-green-100 text-green-700',
  client_rejected: 'bg-red-100 text-red-700',
  client_changes_requested: 'bg-yellow-100 text-yellow-700',
  version_created: 'bg-purple-100 text-purple-700',
  updated: 'bg-orange-100 text-orange-700',
}

const EVENT_LABELS: Record<string, string> = {
  quote_created: 'Quote Created',
  quote_sent: 'Quote Sent',
  client_opened: 'Client Opened',
  client_approved: 'Client Approved',
  client_rejected: 'Client Rejected',
  client_changes_requested: 'Changes Requested',
  version_created: 'New Version',
  updated: 'Updated',
}

interface ActivityWithQuote extends ActivityLog {
  quoteNumber?: string
  clientName?: string
  quoteId: string
}

export default function ActivityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityWithQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterEvent, setFilterEvent] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) { router.push('/login'); return }
    fetchAllActivity()
  }, [router])

  const fetchAllActivity = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get all quotes first, then fetch activity for each
      const quotes = await quotesService.getQuotes(0, 200)
      const allActivities: ActivityWithQuote[] = []

      await Promise.all(
        quotes.map(async (quote) => {
          try {
            const logs = await quotesService.getQuoteActivity(quote.id)
            logs.forEach(log => {
              allActivities.push({
                ...log,
                quoteId: quote.id,
                quoteNumber: quote.quote_number,
                clientName: quote.client?.company_name,
              })
            })
          } catch {
            // skip if activity fetch fails for a quote
          }
        })
      )

      // Sort by created_at descending
      allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(allActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filterEvent
    ? activities.filter(a => a.event_type === filterEvent)
    : activities

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'admin' ? 'All quote activity across the platform' : 'Activity on your quotes'}
            </p>
          </div>

          {/* Stats row */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {['client_approved', 'client_rejected', 'quote_sent', 'client_changes_requested'].map(evt => {
                const count = activities.filter(a => a.event_type === evt).length
                const Icon = EVENT_ICON_MAP[evt] || FileText
                return (
                  <div key={evt} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${EVENT_COLORS[evt] || 'bg-gray-100'}`}>
                        <Icon className="h-4 w-4" suppressHydrationWarning />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500">{EVENT_LABELS[evt]}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              value={filterEvent}
              onChange={e => setFilterEvent(e.target.value)}
            >
              <option value="">All Events</option>
              {Object.entries(EVENT_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">{filtered.length} events</span>
            <button onClick={fetchAllActivity} className="btn-secondary text-sm ml-auto"><RefreshCw className="inline mr-1 h-4 w-4" suppressHydrationWarning /> Refresh</button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading activity...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No activity found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((activity, index) => (
                  <div
                    key={`${activity.id}-${index}`}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/quotes/${activity.quoteId}`)}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${EVENT_COLORS[activity.event_type] || 'bg-gray-100 text-gray-600'}`}>
                      {(() => { const Icon = EVENT_ICON_MAP[activity.event_type] || Pin; return <Icon className="h-4 w-4" suppressHydrationWarning /> })()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EVENT_COLORS[activity.event_type] || 'bg-gray-100 text-gray-600'}`}>
                          {EVENT_LABELS[activity.event_type] || activity.event_type}
                        </span>
                        {activity.quoteNumber && (
                          <span className="text-sm font-medium text-gray-900">{activity.quoteNumber}</span>
                        )}
                        {activity.clientName && (
                          <span className="text-sm text-gray-500">· {activity.clientName}</span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(activity.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

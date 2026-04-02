'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { quotesService } from '@/services/quotes'
import { productsService } from '@/services/products'
import { Quote, QuoteItemSummary, Product, QuoteItemCreate } from '@/types'
import { Download, RefreshCw, Link2, Mail, Plus, Trash2, CheckCircle, XCircle, RotateCcw, FileText, Eye, Pencil, Palette, Ruler, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  changes_requested: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

const EVENT_ICONS: Record<string, string> = {
  quote_created: '📄', quote_sent: '📧', client_opened: '👁️',
  client_approved: '✅', client_rejected: '❌',
  client_changes_requested: '🔄', version_created: '📋', updated: '✏️',
}

const EVENT_LABELS: Record<string, string> = {
  quote_created: 'Quote Created', quote_sent: 'Quote Sent',
  client_opened: 'Client Opened', client_approved: 'Client Approved',
  client_rejected: 'Client Rejected', client_changes_requested: 'Changes Requested',
  version_created: 'New Version Created', updated: 'Quote Updated',
}

const EMPTY_ITEM: QuoteItemCreate = {
  product_name: '', description: '', size_capacity: '',
  color: '', quantity: 1, unit_price: 0, discount_pct: '0', lead_time: '',
}

const fmt = (val: string | number, currency: string) =>
  Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [summary, setSummary] = useState<QuoteItemSummary | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [showSendModal, setShowSendModal] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showPublicLink, setShowPublicLink] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [itemForm, setItemForm] = useState<QuoteItemCreate>(EMPTY_ITEM)
  const [savingItem, setSavingItem] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) { router.push('/login'); return }
    fetchQuote()
    productsService.getProducts().then(setProducts).catch(() => {})
  }, [id])

  const fetchQuote = async () => {
    setLoading(true)
    setError(null)
    try {
      const [quoteData, summaryData] = await Promise.all([
        quotesService.getQuote(id),
        quotesService.getItemsSummary(id).catch(() => null),
      ])
      setQuote(quoteData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingItem(true)
    try {
      await quotesService.addItem(id, itemForm)
      setShowAddItem(false)
      setItemForm(EMPTY_ITEM)
      fetchQuote()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSavingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Remove this item?')) return
    try {
      await quotesService.deleteItem(id, itemId)
      fetchQuote()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const handleProductSelect = (productId: string) => {
    const p = products.find(p => p.id === productId)
    if (p) setItemForm(f => ({ ...f, product_id: p.id, product_name: p.name, description: p.description || '' }))
  }

  const handleNewVersion = async () => {
    if (!confirm('Create a new version of this quote?')) return
    try {
      const newQuote = await quotesService.createNewVersion(id)
      router.push(`/quotes/${newQuote.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create new version')
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingEmail(true)
    try {
      await quotesService.sendQuote(id, { custom_message: customMessage || undefined })
      setShowSendModal(false)
      fetchQuote()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send quote')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const blob = await quotesService.downloadPDF(id)
      if (blob.size === 0) throw new Error('Empty PDF received')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quote?.quote_number || 'quote'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      alert(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  const publicUrl = quote?.public_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/proposal?token=${quote.public_token}`
    : ''

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(publicUrl)
      } else {
        // fallback for HTTP
        const el = document.createElement('textarea')
        el.value = publicUrl
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      alert('Copy failed. Please copy manually: ' + publicUrl)
    }
  }

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading quote...</div>
      </div>
    </div>
  )

  if (error || !quote) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Quote not found'}</div>
            <button className="btn-secondary" onClick={() => router.push('/quotes')}>← Back</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <button onClick={() => router.push('/quotes')} className="hover:text-gray-700">Quotes</button>
            {' > '}
            <span className="text-gray-900">{quote.quote_number}</span>
          </nav>

          {/* Header Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{quote.quote_number}</h1>
                  <span className="text-gray-400 text-sm">v{quote.version}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[quote.status]}`}>
                    {quote.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <div>Client: <span className="font-medium">{quote.client?.company_name}</span> ({quote.client?.contact_name})</div>
                  <div>Currency: <span className="font-medium">{quote.currency}</span></div>
                  {quote.validity_date && <div>Valid Until: <span className="font-medium">{new Date(quote.validity_date).toLocaleDateString()}</span></div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{summary ? fmt(summary.grand_total, quote.currency) : '0.00'} {quote.currency}</div>
                <div className="text-sm text-gray-500">{summary?.item_count || 0} items</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="btn-secondary" onClick={handleDownloadPDF}><Download className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Download PDF</button>
              <button className="btn-secondary" onClick={handleNewVersion}><RefreshCw className="inline mr-2 h-4 w-4" suppressHydrationWarning /> New Version</button>
              <button className="btn-secondary" onClick={() => setShowPublicLink(true)}><Link2 className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Public Link</button>
              <button className="btn-primary" onClick={() => setShowSendModal(true)}><Mail className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Send to Client</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                  <button
                    className="btn-primary text-sm"
                    onClick={() => { setItemForm(EMPTY_ITEM); setShowAddItem(true) }}
                  >
                    <Plus className="inline mr-1 h-4 w-4" suppressHydrationWarning /> Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QTY</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {!quote.items?.length ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center">
                            <div className="text-gray-400 text-4xl mb-2">📦</div>
                            <p className="text-gray-500 text-sm">No items yet</p>
                            <button
                              className="mt-3 text-primary-600 text-sm hover:underline"
                              onClick={() => { setItemForm(EMPTY_ITEM); setShowAddItem(true) }}
                            >
                              + Add your first item
                            </button>
                          </td>
                        </tr>
                      ) : quote.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                            <div className="flex gap-2 mt-0.5">
                              {item.color && <span className="text-xs text-gray-400 flex items-center gap-1"><Palette className="h-3 w-3" /> {item.color}</span>}
                              {item.size_capacity && <span className="text-xs text-gray-400 flex items-center gap-1"><Ruler className="h-3 w-3" /> {item.size_capacity}</span>}
                              {item.lead_time && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {item.lead_time}</span>}
                            </div>
                            {item.mockup_url && (
                              <img src={item.mockup_url} alt="mockup" className="mt-2 h-12 w-12 object-cover rounded border" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{fmt(item.unit_price, quote.currency)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.discount_pct ?? 0}%</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.final_price ? fmt(item.final_price, quote.currency) : '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              className="text-red-400 hover:text-red-600"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" suppressHydrationWarning />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                {summary && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="max-w-xs ml-auto space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span><span>{fmt(summary.subtotal, quote.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Discount</span><span>-{fmt(summary.total_discount_amount, quote.currency)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                        <span>Grand Total</span><span>{fmt(summary.grand_total, quote.currency)} {quote.currency}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(quote.notes || quote.internal_notes) && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  {quote.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
                      <p className="text-sm text-gray-600">{quote.notes}</p>
                    </div>
                  )}
                  {quote.internal_notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Internal Notes</h3>
                      <p className="text-sm text-gray-600">{quote.internal_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
              </div>
              <div className="p-4">
                {!quote.activity_logs?.length ? (
                  <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {quote.activity_logs.map(log => (
                      <div key={log.id} className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                          {EVENT_ICONS[log.event_type] || '📌'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{EVENT_LABELS[log.event_type] || log.event_type}</p>
                          {log.description && <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Add Item Modal ── */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Line Item</h2>
              <button onClick={() => setShowAddItem(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              {/* Product select */}
              {products.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select from Products</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onChange={e => handleProductSelect(e.target.value)}
                    defaultValue=""
                  >
                    <option value="">— Pick a product (optional) —</option>
                    {products.filter(p => p.is_active).map(p => (
                      <option key={p.id} value={p.id}>{p.name}{p.category ? ` (${p.category})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={itemForm.product_name}
                  onChange={e => setItemForm(f => ({ ...f, product_name: e.target.value }))}
                  placeholder="e.g. Custom T-Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={itemForm.description || ''}
                  onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={itemForm.color || ''}
                    onChange={e => setItemForm(f => ({ ...f, color: e.target.value }))}
                    placeholder="e.g. Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size / Capacity</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={itemForm.size_capacity || ''}
                    onChange={e => setItemForm(f => ({ ...f, size_capacity: e.target.value }))}
                    placeholder="e.g. XL, 500ml"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    required type="number" min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={itemForm.quantity}
                    onChange={e => setItemForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                  <input
                    required type="number" min="0" step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={itemForm.unit_price || ''}
                    onChange={e => setItemForm(f => ({ ...f, unit_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number" min="0" max="100" step="0.1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={itemForm.discount_pct || '0'}
                    onChange={e => setItemForm(f => ({ ...f, discount_pct: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={itemForm.lead_time || ''}
                  onChange={e => setItemForm(f => ({ ...f, lead_time: e.target.value }))}
                  placeholder="e.g. 3–5 weeks"
                />
              </div>

              {/* Live price preview */}
              {(itemForm.unit_price || 0) > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{itemForm.quantity} × {itemForm.unit_price}</span>
                    <span>{(itemForm.quantity * (itemForm.unit_price || 0)).toFixed(2)}</span>
                  </div>
                  {parseFloat(itemForm.discount_pct || '0') > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({itemForm.discount_pct}%)</span>
                      <span>-{(itemForm.quantity * (itemForm.unit_price || 0) * parseFloat(itemForm.discount_pct || '0') / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-1">
                    <span>Final Price</span>
                    <span>{(itemForm.quantity * (itemForm.unit_price || 0) * (1 - parseFloat(itemForm.discount_pct || '0') / 100)).toFixed(2)} {quote.currency}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAddItem(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingItem}>
                  {savingItem ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Public Link Modal ── */}
      {showPublicLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900"><Link2 className="inline mr-2 h-5 w-5" suppressHydrationWarning /> Public Quote Link</h2>
              <button onClick={() => setShowPublicLink(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Share this link with your client. They can view the quote and approve/reject without logging in.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    linkCopied ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {linkCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary-600 hover:underline"
              >
                Open in new tab →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Email Modal ── */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900"><Mail className="inline mr-2 h-5 w-5" suppressHydrationWarning /> Send Quote to Client</h2>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                Sending to: <span className="font-medium">{quote.client?.email}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message (optional)</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Add a personal message..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setShowSendModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={sendingEmail}>
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

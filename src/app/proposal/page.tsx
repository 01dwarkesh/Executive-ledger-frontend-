'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { publicQuoteService } from '@/services/publicQuote'
import { Quote } from '@/types'
import { Link2, CheckCircle, XCircle, RotateCcw, Palette, Ruler, Clock } from 'lucide-react'

function ProposalContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<'approve' | 'changes' | 'reject' | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing quote link.')
      setLoading(false)
      return
    }
    publicQuoteService.viewQuote(token)
      .then(setQuote)
      .catch(err => setError(err.message || 'Quote not found or link has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action || !token) return
    setSubmitting(true)
    try {
      const actionMap = { approve: 'approved', changes: 'changes_requested', reject: 'rejected' }
      await publicQuoteService.respondToQuote(token, {
        action: actionMap[action],
        comment: comment || undefined,
      })
      setSubmitted(true)
      setSubmitMessage(
        action === 'approve' ? 'Thank you! Your approval has been recorded.' :
        action === 'reject' ? 'Your response has been recorded.' :
        'Your change request has been sent to the sales team.'
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const subtotal = quote?.items?.reduce((sum, item) => {
    return sum + parseFloat(item.final_price || item.unit_price || '0') * item.quantity
  }, 0) ?? 0

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500 text-lg">Loading quote...</div>
    </div>
  )

  if (error || !quote) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Link2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
        <p className="text-gray-600">{error || 'This quote link is invalid or has expired.'}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          {action === 'approve' ? <CheckCircle className="h-16 w-16 text-green-500" /> : action === 'reject' ? <XCircle className="h-16 w-16 text-red-500" /> : <RotateCcw className="h-16 w-16 text-yellow-500" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Response Submitted</h1>
        <p className="text-gray-600">{submitMessage}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white p-8 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-200 text-sm mb-1">Sales Quote</p>
              <h1 className="text-3xl font-bold">{quote.quote_number}</h1>
              <p className="text-primary-200 mt-1">Version {quote.version}</p>
            </div>
            <div className="text-right">
              {quote.validity_date && (
                <div>
                  <p className="text-primary-200 text-sm">Valid Until</p>
                  <p className="text-xl font-semibold">{new Date(quote.validity_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-lg">
          {/* Client Info */}
          {quote.client && (
            <div className="p-8 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prepared For</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 text-lg">{quote.client.company_name}</p>
                    <p className="text-gray-600 mt-1">{quote.client.contact_name}</p>
                    <p className="text-gray-500 text-sm">{quote.client.email}</p>
                    {quote.client.phone && <p className="text-gray-500 text-sm">{quote.client.phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quote Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quote Number</span>
                      <span className="font-medium text-gray-900">{quote.quote_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Currency</span>
                      <span className="font-medium text-gray-900">{quote.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-gray-900 capitalize">{quote.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Products & Services</h2>
            <div className="space-y-6">
              {quote.items?.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                          <h3 className="font-semibold text-gray-900 text-lg">{item.product_name}</h3>
                        </div>
                        {item.description && <p className="text-gray-600 text-sm mb-3">{item.description}</p>}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {item.color && <span className="flex items-center gap-1"><Palette className="h-4 w-4" /> Color: <strong>{item.color}</strong></span>}
                          {item.size_capacity && <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> Size: <strong>{item.size_capacity}</strong></span>}
                          {item.lead_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Lead Time: <strong>{item.lead_time}</strong></span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {item.final_price || item.unit_price} {quote.currency}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} × {item.unit_price}
                          {parseFloat(item.discount_pct ?? '0') > 0 && (
                            <span className="ml-1 text-green-600">(-{item.discount_pct}%)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mockup Image */}
                    {item.mockup_url && (
                      <div className="mt-4">
                        <img
                          src={item.mockup_url}
                          alt={`${item.product_name} mockup`}
                          className="max-h-48 rounded-lg border border-gray-200 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} {quote.currency}</span>
                </div>
                {parseFloat(quote.tax_pct ?? '0') > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({quote.tax_pct}%)</span>
                    <span className="font-medium">{(subtotal * parseFloat(quote.tax_pct ?? '0') / 100).toFixed(2)} {quote.currency}</span>
                  </div>
                )}
                {parseFloat(quote.adjustment ?? '0') !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Adjustment</span>
                    <span className="font-medium">{quote.adjustment} {quote.currency}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">
                    {(subtotal * (1 + parseFloat(quote.tax_pct ?? '0') / 100) + parseFloat(quote.adjustment ?? '0')).toFixed(2)} {quote.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Terms */}
          {quote.terms && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h2>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}

          {/* Client Response */}
          {quote.status !== 'approved' && quote.status !== 'rejected' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Response</h2>
              <p className="text-gray-500 text-sm mb-6">Please review the quote above and select your response below.</p>

              {quote.client_comment && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-yellow-800">Previous comment:</p>
                  <p className="text-sm text-yellow-700 mt-1">{quote.client_comment}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setAction('approve')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${ action === 'approve' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 text-gray-700' }`}>
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">Approve</div>
                    <div className="text-xs text-gray-500 mt-1">Accept this quote</div>
                  </button>
                  <button type="button" onClick={() => setAction('changes')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${ action === 'changes' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-yellow-300 text-gray-700' }`}>
                    <RotateCcw className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">Request Changes</div>
                    <div className="text-xs text-gray-500 mt-1">Ask for modifications</div>
                  </button>
                  <button type="button" onClick={() => setAction('reject')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${ action === 'reject' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-300 text-gray-700' }`}>
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">Reject</div>
                    <div className="text-xs text-gray-500 mt-1">Decline this quote</div>
                  </button>
                </div>

                {action && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment {action === 'changes' ? '(required — describe what changes you need)' : '(optional)'}
                    </label>
                    <textarea
                      rows={4}
                      required={action === 'changes'}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder={
                        action === 'approve' ? 'Any additional notes...' :
                        action === 'changes' ? 'Please describe the changes you need...' :
                        'Reason for rejection (optional)...'
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {action && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                      action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-yellow-500 hover:bg-yellow-600'
                    } disabled:opacity-50`}
                  >
                    {submitting ? 'Submitting...' : `Submit ${action === 'approve' ? 'Approval' : action === 'reject' ? 'Rejection' : 'Change Request'}`}
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Already responded */}
          {(quote.status === 'approved' || quote.status === 'rejected') && (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-3">
                {quote.status === 'approved' ? <CheckCircle className="h-12 w-12 text-green-500" /> : <XCircle className="h-12 w-12 text-red-500" />}
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">Quote {quote.status}</p>
              {quote.client_comment && (
                <p className="text-gray-500 text-sm mt-2">"{quote.client_comment}"</p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Executive Ledger · {quote.quote_number}
        </p>
      </div>
    </div>
  )
}

export default function ProposalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    }>
      <ProposalContent />
    </Suspense>
  )
}

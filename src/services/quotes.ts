import { api, API_BASE_URL } from '@/lib/api'
import { Quote, QuoteCreate, QuoteUpdate, QuoteListOut, SendQuoteRequest, QuoteItem, QuoteItemCreate, QuoteItemUpdate, QuoteItemSummary, ActivityLog, MockupSaveRequest } from '@/types'

export class QuotesService {
  async getQuotes(skip = 0, limit = 50, status?: string, clientId?: string, search?: string): Promise<QuoteListOut[]> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (status) params.append('status', status)
    if (clientId) params.append('client_id', clientId)
    if (search) params.append('search', search)
    return api.get<QuoteListOut[]>(`/quotes/?${params}`)
  }

  async getQuote(quoteId: string): Promise<Quote> {
    return api.get<Quote>(`/quotes/${quoteId}/`)
  }

  async createQuote(quoteData: QuoteCreate): Promise<Quote> {
    return api.post<Quote>('/quotes/', quoteData)
  }

  async updateQuote(quoteId: string, quoteData: QuoteUpdate): Promise<Quote> {
    return api.put<Quote>(`/quotes/${quoteId}/`, quoteData)
  }

  async deleteQuote(quoteId: string): Promise<void> {
    await api.delete(`/quotes/${quoteId}/`)
  }

  async createNewVersion(quoteId: string): Promise<Quote> {
    return api.post<Quote>(`/quotes/${quoteId}/new-version/`)
  }

  async getQuoteVersions(quoteId: string): Promise<QuoteListOut[]> {
    return api.get<QuoteListOut[]>(`/quotes/${quoteId}/versions/`)
  }

  async sendQuote(quoteId: string, emailData?: SendQuoteRequest): Promise<void> {
    await api.post(`/quotes/${quoteId}/send-email/`, emailData || {})
  }

  async getQuoteActivity(quoteId: string): Promise<ActivityLog[]> {
    return api.get<ActivityLog[]>(`/quotes/${quoteId}/activity/`)
  }

  async downloadPDF(quoteId: string): Promise<Blob> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const response = await fetch(`/api/pdf/${quoteId}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${text || 'Failed to download PDF'}`)
    }
    return response.blob()
  }

  // Quote Items
  async getItems(quoteId: string): Promise<QuoteItem[]> {
    return api.get<QuoteItem[]>(`/quotes/${quoteId}/items/`)
  }

  async addItem(quoteId: string, item: QuoteItemCreate): Promise<QuoteItem> {
    return api.post<QuoteItem>(`/quotes/${quoteId}/items/`, item)
  }

  async updateItem(quoteId: string, itemId: string, item: QuoteItemUpdate): Promise<QuoteItem> {
    return api.put<QuoteItem>(`/quotes/${quoteId}/items/${itemId}/`, item)
  }

  async deleteItem(quoteId: string, itemId: string): Promise<void> {
    await api.delete(`/quotes/${quoteId}/items/${itemId}/`)
  }

  async getItemsSummary(quoteId: string): Promise<QuoteItemSummary> {
    return api.get<QuoteItemSummary>(`/quotes/${quoteId}/items/summary/`)
  }

  async uploadLogo(quoteId: string, itemId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return api.postForm(`/quotes/${quoteId}/items/${itemId}/upload-logo`, formData)
  }

  async saveMockup(quoteId: string, itemId: string, data: MockupSaveRequest): Promise<any> {
    return api.post(`/quotes/${quoteId}/items/${itemId}/save-mockup`, data)
  }

  async grayscaleLogo(quoteId: string, itemId: string): Promise<any> {
    return api.post(`/quotes/${quoteId}/items/${itemId}/grayscale-logo`)
  }
}

export const quotesService = new QuotesService()

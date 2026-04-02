import { api } from '@/lib/api'
import { Quote, PublicQuoteRespond } from '@/types'

export class PublicQuoteService {
  async viewQuote(token: string): Promise<Quote> {
    return api.get<Quote>(`/public/quote/${token}/`)
  }

  async respondToQuote(token: string, data: PublicQuoteRespond): Promise<any> {
    return api.post(`/public/quote/${token}/respond/`, data)
  }
}

export const publicQuoteService = new PublicQuoteService()

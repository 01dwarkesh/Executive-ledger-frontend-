import { api } from '@/lib/api'
import { ActivityLog } from '@/types'

export class ActivityService {
  async getQuoteActivity(quoteId: string): Promise<ActivityLog[]> {
    return api.get<ActivityLog[]>(`/quotes/${quoteId}/activity/`)
  }
}

export const activityService = new ActivityService()

import { api } from '@/lib/api'
import { DashboardStats } from '@/types'

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/quotes/dashboard')
  }
}

export const dashboardService = new DashboardService()

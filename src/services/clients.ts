import { api } from '@/lib/api'
import { Client, ClientCreate, ClientUpdate } from '@/types'

export class ClientsService {
  async getClients(skip = 0, limit = 50, search?: string): Promise<Client[]> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (search) params.append('search', search)
    return api.get<Client[]>(`/clients/?${params}`)
  }

  async getClient(clientId: string): Promise<Client> {
    return api.get<Client>(`/clients/${clientId}/`)
  }

  async createClient(clientData: ClientCreate): Promise<Client> {
    return api.post<Client>('/clients/', clientData)
  }

  async updateClient(clientId: string, clientData: ClientUpdate): Promise<Client> {
    return api.put<Client>(`/clients/${clientId}/`, clientData)
  }

  async deleteClient(clientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/`)
  }

  async getClientStats(): Promise<any> {
    return api.get('/clients/stats/summary/')
  }
}

export const clientsService = new ClientsService()

import { api } from '@/lib/api'
import { LoginRequest, TokenOut, User, UserCreate, UserUpdate, UserPasswordReset } from '@/types'

export class AuthService {
  async login(credentials: LoginRequest): Promise<TokenOut> {
    const data = await api.post<TokenOut>('/auth/login/', credentials)
    localStorage.setItem('authToken', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('isAuthenticated', 'true')
    return data
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  }

  async updateProfile(data: { full_name: string }): Promise<User> {
    const updated = await api.put<User>('/auth/me/', data)
    localStorage.setItem('user', JSON.stringify(updated))
    return updated
  }

  async changePassword(newPassword: string): Promise<void> {
    await api.post('/auth/me/change-password/', { new_password: newPassword })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await api.get<User>('/auth/me/')
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err: any) {
      // Only logout on 401 (invalid token), not on network errors
      if (err?.status === 401) {
        this.logout()
      }
      return null
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('authToken')
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try { return JSON.parse(userStr) } catch { return null }
  }

  async register(userData: UserCreate): Promise<User> {
    return api.post<User>('/auth/register/', userData)
  }

  async getUsers(): Promise<User[]> {
    return api.get<User[]>('/auth/users/')
  }

  async createUser(userData: UserCreate): Promise<User> {
    return api.post<User>('/auth/users/', userData)
  }

  async getUser(userId: string): Promise<User> {
    return api.get<User>(`/auth/users/${userId}/`)
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<User> {
    const data = await api.put<User>(`/auth/users/${userId}/`, userData)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/auth/users/${userId}/reset-password/`, { new_password: newPassword })
  }

  async deactivateUser(userId: string): Promise<void> {
    await api.post(`/auth/users/${userId}/deactivate/`)
  }

  async reactivateUser(userId: string): Promise<User> {
    return api.post<User>(`/auth/users/${userId}/reactivate/`)
  }
}

export const authService = new AuthService()

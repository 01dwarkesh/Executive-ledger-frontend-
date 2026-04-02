// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://executive-ledger.onrender.com/api/v1'

// API Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// HTTP Client with authentication
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    }

    // Only set Content-Type for JSON bodies
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      })

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T
      }

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        let errData: any = {}
        if (contentType.includes('application/json')) {
          errData = await response.json()
        }
        const msg = errData?.detail?.[0]?.msg || errData?.detail || errData?.message || `HTTP ${response.status}`
        throw new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), response.status, errData)
      }

      if (contentType.includes('application/json')) {
        return response.json() as Promise<T>
      }

      return response.blob() as unknown as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Network error occurred')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: formData })
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)

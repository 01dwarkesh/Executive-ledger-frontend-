import { api } from '@/lib/api'
import { Product, ProductCreate } from '@/types'

export class ProductsService {
  async getProducts(): Promise<Product[]> {
    return api.get<Product[]>('/products/')
  }

  async createProduct(data: ProductCreate): Promise<Product> {
    return api.post<Product>('/products/', data)
  }

  async updateProduct(productId: string, data: Partial<ProductCreate> & { is_active?: boolean }): Promise<Product> {
    return api.put<Product>(`/products/${productId}/`, data)
  }

  async deactivateProduct(productId: string): Promise<void> {
    await api.put(`/products/${productId}/`, { is_active: false })
  }

  async reactivateProduct(productId: string): Promise<void> {
    await api.put(`/products/${productId}/`, { is_active: true })
  }
}

export const productsService = new ProductsService()

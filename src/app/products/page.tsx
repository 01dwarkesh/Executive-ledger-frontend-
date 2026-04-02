'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { productsService } from '@/services/products'
import { Product, ProductCreate } from '@/types'
import { Plus, Pencil, Package } from 'lucide-react'

const SAMPLE_PRODUCTS: ProductCreate[] = [
  { name: 'T-Shirt', category: 'Apparel', description: 'Cotton round neck t-shirt', placeholder_image_url: '' },
  { name: 'Polo Shirt', category: 'Apparel', description: 'Premium polo shirt', placeholder_image_url: '' },
  { name: 'Hoodie', category: 'Apparel', description: 'Fleece pullover hoodie', placeholder_image_url: '' },
  { name: 'Mug 11oz', category: 'Drinkware', description: 'White ceramic mug', placeholder_image_url: '' },
  { name: 'Bottle 500ml', category: 'Drinkware', description: 'Stainless steel bottle', placeholder_image_url: '' },
  { name: 'Cap', category: 'Accessories', description: 'Structured baseball cap', placeholder_image_url: '' },
  { name: 'Tote Bag', category: 'Bags', description: 'Canvas tote bag', placeholder_image_url: '' },
  { name: 'Notebook A5', category: 'Stationery', description: 'Hardcover A5 notebook', placeholder_image_url: '' },
  { name: 'Pen', category: 'Stationery', description: 'Metal ballpoint pen', placeholder_image_url: '' },
  { name: 'USB Drive 32GB', category: 'Tech', description: '32GB USB flash drive', placeholder_image_url: '' },
]

const CATEGORIES = ['Apparel', 'Drinkware', 'Accessories', 'Bags', 'Stationery', 'Tech', 'Other']

export default function ProductsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seedingAll, setSeedingAll] = useState(false)
  const [form, setForm] = useState<ProductCreate>({ name: '', category: '', description: '', placeholder_image_url: '' })
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<ProductCreate>({ name: '', category: '', description: '', placeholder_image_url: '' })

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) { router.push('/login'); return }
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await productsService.getProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await productsService.createProduct(form)
      setShowModal(false)
      setForm({ name: '', category: '', description: '', placeholder_image_url: '' })
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (productId: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return
    try {
      await productsService.deactivateProduct(productId)
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    setSaving(true)
    try {
      await productsService.updateProduct(editProduct.id, editForm)
      setEditProduct(null)
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleReactivate = async (productId: string, name: string) => {
    if (!confirm(`Reactivate "${name}"?`)) return
    try {
      await productsService.reactivateProduct(productId)
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reactivate')
    }
  }

  const handleSeedAll = async () => {
    if (!confirm(`Add ${SAMPLE_PRODUCTS.length} sample products?`)) return
    setSeedingAll(true)
    try {
      for (const p of SAMPLE_PRODUCTS) {
        await productsService.createProduct(p)
      }
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Seeding failed')
    } finally {
      setSeedingAll(false)
    }
  }

  const isAdmin = user?.role === 'admin'
  const activeProducts = products.filter(p => p.is_active)
  const inactiveProducts = products.filter(p => !p.is_active)

  const categoryColors: Record<string, string> = {
    Apparel: 'bg-blue-100 text-blue-700',
    Drinkware: 'bg-cyan-100 text-cyan-700',
    Accessories: 'bg-purple-100 text-purple-700',
    Bags: 'bg-orange-100 text-orange-700',
    Stationery: 'bg-yellow-100 text-yellow-700',
    Tech: 'bg-green-100 text-green-700',
    Other: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                {isAdmin ? 'Manage predefined product catalog for quotes.' : 'Available products for quotes.'}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                {products.length === 0 && (
                  <button
                    className="btn-secondary"
                    onClick={handleSeedAll}
                    disabled={seedingAll}
                  >
                    {seedingAll ? 'Adding...' : '🌱 Add Sample Products'}
                  </button>
                )}
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <Plus className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Add Product
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-green-600">{activeProducts.length}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-gray-400">{inactiveProducts.length}</p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 text-sm mb-6">Add sample products to get started quickly.</p>
              {isAdmin && (
                <button className="btn-primary" onClick={handleSeedAll} disabled={seedingAll}>
                  {seedingAll ? 'Adding...' : <><Package className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Add 10 Sample Products</>}
                </button>
              )}
            </div>
          )}

          {/* Active Products Grid */}
          {activeProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Active ({activeProducts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    {/* Product image placeholder */}
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 ${categoryColors[product.category || 'Other'] || 'bg-gray-100 text-gray-700'}`}>
                          {product.category || 'Other'}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      )}
                      {isAdmin && (
                        <div className="mt-3 flex gap-3">
                          <button
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => { setEditProduct(product); setEditForm({ name: product.name, category: product.category || '', description: product.description || '', placeholder_image_url: product.placeholder_image_url || '' }) }}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            className="text-xs text-red-500 hover:text-red-700"
                            onClick={() => handleDeactivate(product.id, product.name)}
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Products */}
          {isAdmin && inactiveProducts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Inactive ({inactiveProducts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inactiveProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow opacity-50">
                    <div className="h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-500 text-sm line-through">{product.name}</h3>
                      <span className="text-xs text-gray-400">{product.category || 'Inactive'}</span>
                      <div>
                        <button
                          className="mt-3 text-xs text-green-600 hover:text-green-800"
                          onClick={() => handleReactivate(product.id, product.name)}
                        >
                          Reactivate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. T-Shirt, Mug 11oz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={form.category || ''}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">— Select category —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder Image URL</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={form.placeholder_image_url || ''}
                  onChange={e => setForm(f => ({ ...f, placeholder_image_url: e.target.value }))}
                  placeholder="https://... or /uploads/..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
              <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editForm.category || ''}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">— Select category —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editForm.description || ''}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

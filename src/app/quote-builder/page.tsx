'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Download, CheckCircle, Upload } from 'lucide-react'

export default function QuoteBuilderPage() {
  const router = useRouter()
  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      description: 'Enterprise Server Infrastructure Management',
      qty: 1,
      unitPrice: 125000,
      discount: 0,
      amount: 125000
    },
    {
      id: 2,
      description: 'Cloud Migration Strategy Audit',
      qty: 1,
      unitPrice: 45000,
      discount: 0,
      amount: 45000
    },
    {
      id: 3,
      description: 'Custom Security Protocol Implementation',
      qty: 1,
      unitPrice: 78000,
      discount: 0,
      amount: 78000
    }
  ])

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authToken')
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => total + item.amount, 0)
  }

  const addLineItem = () => {
    const newItem = {
      id: lineItems.length + 1,
      description: '',
      qty: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (id: number, field: string, value: any) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
          const amount = (updatedItem.qty * updatedItem.unitPrice) - (updatedItem.qty * updatedItem.unitPrice * updatedItem.discount / 100)
          updatedItem.amount = amount
        }
        return updatedItem
      }
      return item
    })
    setLineItems(updatedItems)
  }

  const subtotal = calculateTotal()
  const tax = 0
  const adjustment = 0
  const grandTotal = subtotal + tax + adjustment

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Quote Builder</h1>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">Quote Builder</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Templates</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Archived</button>
              </div>
            </div>
          </div>

          <div className="flex space-x-6">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Line-Item Specification</h2>
                  <div className="flex space-x-4 mt-4">
                    <button className="btn-secondary">
                      <Upload className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Import CSV
                    </button>
                    <button className="btn-primary">
                      <CheckCircle className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Finalize Quote
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">#</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Item Description</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2">QTY</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Unit Price</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Discount</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="py-3">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="Enter item description"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </td>
                            <td className="py-3">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <span className="ml-1 text-sm text-gray-500">%</span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-sm font-medium text-gray-900">
                              ${item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={addLineItem}
                    className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Add New Line Item
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={4}
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Private Internal Notes</h3>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="Internal notes (not visible to client)..."
                  />
                </div>
              </div>
            </div>

            <div className="w-80">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">Client:</label>
                      <select className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>Select Client</option>
                        <option>Acme Corp</option>
                        <option>North Star Logistics</option>
                        <option>GreenPeak Energy</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">Quote #:</label>
                      <input type="text" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" placeholder="Auto-generated" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">Currency:</label>
                      <select className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">Date:</label>
                      <input type="date" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">Validity:</label>
                      <select className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (0%)</span>
                      <span className="font-medium text-gray-900">${tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adjustment</span>
                      <span className="font-medium text-gray-900">${adjustment.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-gray-900">GRAND TOTAL DUE</span>
                        <span className="text-gray-900">${grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full btn-primary mt-4">
                    <Download className="inline mr-2 h-4 w-4" suppressHydrationWarning /> Generate & Preview PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

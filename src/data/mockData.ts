// Legacy mock data - no longer used in production, kept for reference only

// Mock Users
export const mockUsers: any[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-31T10:30:00Z',
  },
  {
    id: '2',
    name: 'John Manager',
    email: 'john@example.com',
    role: 'user',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-30T15:45:00Z',
  },
]

// Mock Clients
export const mockClients: any[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    status: 'active',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-03-25T11:20:00Z',
  },
  {
    id: '2',
    name: 'Digital Marketing Pro',
    email: 'hello@digitalmarketing.com',
    phone: '+1 (555) 987-6543',
    company: 'Digital Marketing Pro',
    address: '456 Marketing Ave, New York, NY 10001',
    status: 'active',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-03-28T16:30:00Z',
  },
  {
    id: '3',
    name: 'Creative Agency',
    email: 'info@creativeagency.com',
    phone: '+1 (555) 456-7890',
    company: 'Creative Agency LLC',
    address: '789 Design Blvd, Los Angeles, CA 90001',
    status: 'inactive',
    createdAt: '2024-01-05T13:45:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
  },
]

// Mock Quotes
export const mockQuotes: any[] = [
  {
    id: '1',
    clientId: '1',
    client: mockClients[0],
    quoteNumber: 'Q-2024-001',
    title: 'Website Development Package',
    description: 'Complete website development with modern design and functionality',
    amount: 5500,
    status: 'accepted',
    validUntil: '2024-04-15T23:59:59Z',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-20T14:20:00Z',
  },
  {
    id: '2',
    clientId: '2',
    client: mockClients[1],
    quoteNumber: 'Q-2024-002',
    title: 'SEO Optimization Services',
    description: '3-month SEO optimization package for better search rankings',
    amount: 3200,
    status: 'sent',
    validUntil: '2024-04-10T23:59:59Z',
    createdAt: '2024-03-18T09:15:00Z',
    updatedAt: '2024-03-18T09:15:00Z',
  },
  {
    id: '3',
    clientId: '1',
    client: mockClients[0],
    quoteNumber: 'Q-2024-003',
    title: 'Mobile App Development',
    description: 'Cross-platform mobile app for iOS and Android',
    amount: 12000,
    status: 'draft',
    validUntil: '2024-04-20T23:59:59Z',
    createdAt: '2024-03-22T16:45:00Z',
    updatedAt: '2024-03-22T16:45:00Z',
  },
  {
    id: '4',
    clientId: '3',
    client: mockClients[2],
    quoteNumber: 'Q-2024-004',
    title: 'Brand Identity Package',
    description: 'Complete brand identity including logo, colors, and guidelines',
    amount: 2800,
    status: 'rejected',
    validUntil: '2024-03-25T23:59:59Z',
    createdAt: '2024-03-10T11:30:00Z',
    updatedAt: '2024-03-26T13:15:00Z',
  },
  {
    id: '5',
    clientId: '2',
    client: mockClients[1],
    quoteNumber: 'Q-2024-005',
    title: 'Content Marketing Strategy',
    description: '6-month content marketing strategy and implementation',
    amount: 4500,
    status: 'expired',
    validUntil: '2024-03-20T23:59:59Z',
    createdAt: '2024-02-28T14:00:00Z',
    updatedAt: '2024-03-21T10:30:00Z',
  },
]

// Mock Activity Logs
export const mockActivityLogs: any[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    action: 'Created new quote',
    entityType: 'quote',
    entityId: '3',
    details: { quoteNumber: 'Q-2024-003', amount: 12000 },
    createdAt: '2024-03-22T16:45:00Z',
  },
  {
    id: '2',
    userId: '1',
    user: mockUsers[0],
    action: 'Updated quote status',
    entityType: 'quote',
    entityId: '1',
    details: { oldStatus: 'sent', newStatus: 'accepted' },
    createdAt: '2024-03-20T14:20:00Z',
  },
  {
    id: '3',
    userId: '2',
    user: mockUsers[1],
    action: 'Created new client',
    entityType: 'client',
    entityId: '2',
    details: { clientName: 'Digital Marketing Pro' },
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '4',
    userId: '1',
    user: mockUsers[0],
    action: 'Sent quote to client',
    entityType: 'quote',
    entityId: '2',
    details: { quoteNumber: 'Q-2024-002', clientEmail: 'hello@digitalmarketing.com' },
    createdAt: '2024-03-18T09:15:00Z',
  },
  {
    id: '5',
    userId: '2',
    user: mockUsers[1],
    action: 'Updated client information',
    entityType: 'client',
    entityId: '1',
    details: { field: 'phone', oldValue: '+1 (555) 000-0000', newValue: '+1 (555) 123-4567' },
    createdAt: '2024-03-25T11:20:00Z',
  },
  {
    id: '6',
    userId: '1',
    user: mockUsers[0],
    action: 'Quote rejected',
    entityType: 'quote',
    entityId: '4',
    details: { quoteNumber: 'Q-2024-004', reason: 'Budget constraints' },
    createdAt: '2024-03-26T13:15:00Z',
  },
]

// Mock Dashboard Stats
export const mockDashboardStats: any = {
  totalClients: mockClients.filter(c => c.status === 'active').length,
  totalQuotes: mockQuotes.length,
  pendingQuotes: mockQuotes.filter(q => q.status === 'sent').length,
  acceptedQuotes: mockQuotes.filter(q => q.status === 'accepted').length,
  recentActivity: mockActivityLogs.slice(0, 5),
}

// Helper functions for dynamic data generation
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const generateQuoteNumber = () => {
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 999) + 1
  return `Q-${year}-${sequence.toString().padStart(3, '0')}`
}

export const addDaysToDate = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString()
}

export const getRandomStatus = <T extends string>(statuses: T[]): T => {
  return statuses[Math.floor(Math.random() * statuses.length)]
}

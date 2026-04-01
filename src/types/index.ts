// User Types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'sales'
  is_active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserCreate {
  email: string
  password: string
  full_name: string
  role?: 'admin' | 'sales'
}

export interface UserUpdate {
  full_name?: string
  role?: 'admin' | 'sales'
  is_active?: boolean
}

export interface UserPasswordReset {
  new_password: string
}

export interface TokenOut {
  access_token: string
  token_type: string
  user: User
}

// Client Types
export interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string | null
  notes?: string | null
  tier?: string | null
  industry?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ClientCreate {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  notes?: string
  tier?: string
  industry?: string
}

export interface ClientUpdate {
  company_name?: string
  contact_name?: string
  email?: string
  phone?: string
  notes?: string
  tier?: string
  industry?: string
}

// Product Types
export interface Product {
  id: string
  name: string
  category?: string
  description?: string
  placeholder_image_url?: string
  is_active: boolean
  created_at: string
}

export interface ProductCreate {
  name: string
  category?: string
  description?: string
  placeholder_image_url?: string
}

// Quote Types
export interface Quote {
  id: string
  quote_number: string
  parent_quote_id?: string
  version: number
  client_id: string
  created_by: string
  validity_date?: string
  notes?: string
  internal_notes?: string
  terms?: string
  status: 'draft' | 'sent' | 'approved' | 'changes_requested' | 'rejected'
  currency: string
  tax_pct?: string
  adjustment?: string
  public_token?: string
  client_comment?: string
  created_at: string
  updated_at: string
  client?: Client
  items?: QuoteItem[]
  activity_logs?: ActivityLog[]
}

export interface QuoteCreate {
  client_id: string
  validity_date?: string
  notes?: string
  internal_notes?: string
  terms?: string
  currency?: string
  tax_pct?: string
  adjustment?: string
}

export interface QuoteUpdate {
  client_id?: string
  validity_date?: string
  notes?: string
  internal_notes?: string
  terms?: string
  status?: 'draft' | 'sent' | 'approved' | 'changes_requested' | 'rejected'
  currency?: string
  tax_pct?: string
  adjustment?: string
  client_comment?: string
}

export interface QuoteListOut {
  id: string
  quote_number: string
  version: number
  status: 'draft' | 'sent' | 'approved' | 'changes_requested' | 'rejected'
  currency: string
  public_token: string
  client?: Client
  created_at: string
  updated_at: string
}

export interface SendQuoteRequest {
  custom_message?: string
}

// Quote Item Types
export interface QuoteItem {
  id: string
  quote_id: string
  product_id?: string
  product_name: string
  description?: string
  size_capacity?: string
  color?: string
  quantity: number
  unit_price: string
  discount_pct?: string
  final_price?: string
  lead_time?: string
  logo_url?: string
  mockup_url?: string
  logo_x?: number
  logo_y?: number
  logo_scale?: number
  sort_order: number
  created_at: string
}

export interface QuoteItemCreate {
  product_id?: string
  product_name: string
  description?: string
  size_capacity?: string
  color?: string
  quantity: number
  unit_price?: number
  discount_pct?: string
  lead_time?: string
  sort_order?: number
}

export interface QuoteItemUpdate {
  product_name?: string
  description?: string
  size_capacity?: string
  color?: string
  quantity?: number
  unit_price?: number
  discount_pct?: string
  lead_time?: string
  logo_url?: string
  mockup_url?: string
  logo_x?: number
  logo_y?: number
  logo_scale?: number
  sort_order?: number
}

export interface QuoteItemSummary {
  subtotal: string
  total_discount_amount: string
  grand_total: string
  item_count: number
}

export interface MockupSaveRequest {
  logo_x: number
  logo_y: number
  logo_scale: number
  mockup_image_base64: string
}

// Dashboard Types
export interface DashboardStats {
  total_active: number
  pending_approval: number
  drafts: number
  approved: number
  rejected: number
  total_value: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  quote_id: string
  event_type: 'quote_created' | 'quote_sent' | 'client_opened' | 'client_approved' | 'client_rejected' | 'client_changes_requested' | 'version_created' | 'updated'
  description?: string
  performed_by?: string
  created_at: string
}

// Import/Export Types
export interface ImportResult {
  created: number
  errors: string[]
}

export interface PublicQuoteRespond {
  action: string
  comment?: string
}

// HTTP Validation Error
export interface HTTPValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

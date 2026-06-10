// ================================================================
// Types مُشتقة من Supabase Schema
// يمكن تحديثها تلقائياً بـ: npx supabase gen types typescript
// ================================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Enums ──────────────────────────────────────────────────────
export type PaymentMethod    = 'cash' | 'credit' | 'deferred'
export type SaleStatus       = 'completed' | 'cancelled' | 'refunded' | 'partial_refund'
export type PurchaseStatus   = 'pending' | 'partial' | 'paid'
export type InventoryMovement= 'purchase' | 'sale' | 'return_in' | 'return_out' | 'adjustment' | 'damaged' | 'expired'
export type ExpenseCategory  = 'rent' | 'salaries' | 'utilities' | 'maintenance' | 'transport' | 'marketing' | 'supplies' | 'other'

// ── Tables ─────────────────────────────────────────────────────

export interface Role {
  id:          string
  name:        string
  name_ar:     string
  permissions: Record<string, boolean>
  created_at:  string
}

export interface User {
  id:         string
  name:       string
  username:   string
  role_id:    string
  is_active:  boolean
  created_at: string
  updated_at: string
  role?:      Role
}

export interface Company {
  id:         string
  name:       string
  phone:      string | null
  address:    string | null
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id:         string
  name:       string
  created_at: string
}

export interface DosageForm {
  id:         string
  code:       string
  name_ar:    string
  sort_order: number
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id:         string
  name:       string
  parent_id:  string | null
  created_at: string
  parent?:    Category
  children?:  Category[]
}

export interface Supplier {
  id:         string
  name:       string
  phone:      string | null
  email:      string | null
  address:    string | null
  balance:    number
  notes:      string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id:          string
  name:        string
  phone:       string | null
  email:       string | null
  debt:        number
  total_spent: number
  notes:       string | null
  is_deleted:  boolean
  created_at:  string
  updated_at:  string
}

export interface Product {
  id:                     string
  barcode:                string | null
  name_ar:                string
  name_en:                string | null
  scientific_name:        string | null
  strength:               string | null
  category_id:            string | null
  company_id:             string | null
  dosage_form_id:         string | null
  unit_id:                string | null
  supplier_id:            string | null
  purchase_price:         number
  sale_price:             number
  stock:                  number
  min_stock:              number
  requires_prescription:  boolean
  is_active:              boolean
  notes:                  string | null
  created_at:             string
  updated_at:             string
  // Relations
  category?:    Category
  company?:     Company
  dosage_form?: DosageForm
  unit?:        Unit
  supplier?:    Supplier
  batches?:     Batch[]
}

export interface Batch {
  id:             string
  product_id:     string
  batch_number:   string
  expiry_date:    string
  quantity:       number
  purchase_price: number
  sale_price:     number
  supplier_id:    string | null
  purchase_id:    string | null
  is_active:      boolean
  created_at:     string
  updated_at:     string
  product?:       Product
  supplier?:      Supplier
}

export interface Sale {
  id:              string
  invoice_number:  string
  customer_id:     string | null
  cash_session_id: string | null
  user_id:         string | null
  total_amount:    number
  discount:        number
  tax:             number
  net_amount:      number
  paid_amount:     number
  payment_method:  PaymentMethod
  status:          SaleStatus
  notes:           string | null
  created_at:      string
  updated_at:      string
  // Relations
  customer?:   Customer
  user?:       User
  sale_items?: SaleItem[]
}

export interface SaleItem {
  id:           string
  sale_id:      string
  product_id:   string | null
  batch_id:     string | null
  product_name: string
  unit_name:    string
  quantity:     number
  sell_price:   number
  buy_price:    number
  subtotal:     number
  cogs:         number
  gross_profit: number
  product?:     Product
  batch?:       Batch
}

export interface Purchase {
  id:             string
  invoice_number: string
  supplier_id:    string | null
  user_id:        string | null
  total_amount:   number
  paid_amount:    number
  payment_method: PaymentMethod
  status:         PurchaseStatus
  notes:          string | null
  created_at:     string
  updated_at:     string
  // Relations
  supplier?:        Supplier
  purchase_items?:  PurchaseItem[]
}

export interface PurchaseItem {
  id:           string
  purchase_id:  string
  product_id:   string | null
  batch_id:     string | null
  product_name: string
  unit_name:    string
  quantity:     number
  buy_price:    number
  subtotal:     number
  product?:     Product
  batch?:       Batch
}

export interface Refund {
  id:             string
  invoice_number: string
  sale_id:        string
  customer_id:    string | null
  user_id:        string | null
  total_refunded: number
  refund_method:  PaymentMethod
  reason:         string | null
  notes:          string | null
  created_at:     string
  sale?:          Sale
  customer?:      Customer
  refund_items?:  RefundItem[]
}

export interface RefundItem {
  id:           string
  refund_id:    string
  sale_item_id: string
  product_id:   string | null
  batch_id:     string | null
  product_name: string
  quantity:     number
  sell_price:   number
  buy_price:    number
  subtotal:     number
}

export interface DebtPayment {
  id:             string
  customer_id:    string | null
  supplier_id:    string | null
  amount:         number
  payment_method: PaymentMethod
  created_by:     string | null
  notes:          string | null
  created_at:     string
}

export interface OperationalExpense {
  id:           string
  category:     ExpenseCategory
  description:  string
  amount:       number
  expense_date: string
  created_by:   string | null
  notes:        string | null
  created_at:   string
}

export interface CashRegister {
  id:              string
  opening_balance: number
  closing_balance: number | null
  opened_by:       string | null
  closed_by:       string | null
  opened_at:       string
  closed_at:       string | null
  notes:           string | null
}

// ── Views ──────────────────────────────────────────────────────

export interface InventoryReportRow {
  id:                    string
  barcode:               string | null
  name_ar:               string
  name_en:               string | null
  scientific_name:       string | null
  strength:              string | null
  category:              string | null
  company:               string | null
  dosage_form:           string | null
  unit:                  string | null
  default_cost:          number
  default_price:         number
  stock:                 number
  min_stock:             number
  shortage:              number
  active_batches:        number
  nearest_expiry:        string | null
  requires_prescription: boolean
  stock_status:          'نفد' | 'منخفض' | 'متوفر'
  expiry_status:         'صالحة' | 'تنتهي قريباً' | 'منتهية الصلاحية' | 'لا ينتهي'
  supplier_name:         string | null
  is_active:             boolean
}

export interface StockAlertRow {
  id:             string
  name_ar:        string
  barcode:        string | null
  stock:          number
  min_stock:      number
  nearest_expiry: string | null
  days_to_expiry: number | null
  supplier_name:  string | null
  supplier_phone: string | null
  alert_types:    string[]
}

export interface ProfitSummaryRow {
  period_type:           'daily' | 'weekly' | 'monthly'
  period_start:          string
  period_end:            string
  period_label:          string
  total_invoices:        number
  total_revenue:         number
  total_cogs:            number
  gross_profit:          number
  operational_expenses:  number
  total_refunds:         number
  net_profit:            number
  total_discounts:       number
}

// ── Supabase Database Type (للاستخدام مع createClient) ─────────
export interface Database {
  public: {
    Tables: {
      products:               { Row: Product;            Insert: Partial<Product>;            Update: Partial<Product> }
      batches:                { Row: Batch;              Insert: Partial<Batch>;              Update: Partial<Batch> }
      sales:                  { Row: Sale;               Insert: Partial<Sale>;               Update: Partial<Sale> }
      sale_items:             { Row: SaleItem;           Insert: Partial<SaleItem>;           Update: Partial<SaleItem> }
      purchases:              { Row: Purchase;           Insert: Partial<Purchase>;           Update: Partial<Purchase> }
      purchase_items:         { Row: PurchaseItem;       Insert: Partial<PurchaseItem>;       Update: Partial<PurchaseItem> }
      refunds:                { Row: Refund;             Insert: Partial<Refund>;             Update: Partial<Refund> }
      refund_items:           { Row: RefundItem;         Insert: Partial<RefundItem>;         Update: Partial<RefundItem> }
      customers:              { Row: Customer;           Insert: Partial<Customer>;           Update: Partial<Customer> }
      suppliers:              { Row: Supplier;           Insert: Partial<Supplier>;           Update: Partial<Supplier> }
      categories:             { Row: Category;           Insert: Partial<Category>;           Update: Partial<Category> }
      companies:              { Row: Company;            Insert: Partial<Company>;            Update: Partial<Company> }
      units:                  { Row: Unit;               Insert: Partial<Unit>;               Update: Partial<Unit> }
      dosage_forms:           { Row: DosageForm;         Insert: Partial<DosageForm>;         Update: Partial<DosageForm> }
      roles:                  { Row: Role;               Insert: Partial<Role>;               Update: Partial<Role> }
      users:                  { Row: User;               Insert: Partial<User>;               Update: Partial<User> }
      debt_payments:          { Row: DebtPayment;        Insert: Partial<DebtPayment>;        Update: Partial<DebtPayment> }
      operational_expenses:   { Row: OperationalExpense; Insert: Partial<OperationalExpense>; Update: Partial<OperationalExpense> }
      cash_register:          { Row: CashRegister;       Insert: Partial<CashRegister>;       Update: Partial<CashRegister> }
      transactions:           { Row: Record<string,Json>; Insert: Record<string,Json>; Update: Record<string,Json> }
      audit_log:              { Row: Record<string,Json>; Insert: Record<string,Json>; Update: Record<string,Json> }
      inventory_transactions: { Row: Record<string,Json>; Insert: Record<string,Json>; Update: Record<string,Json> }
      product_alternatives:   { Row: Record<string,Json>; Insert: Record<string,Json>; Update: Record<string,Json> }
      invoice_sequences:      { Row: Record<string,Json>; Insert: Record<string,Json>; Update: Record<string,Json> }
    }
    Views: {
      v_inventory_report:    { Row: InventoryReportRow }
      v_stock_alerts:        { Row: StockAlertRow }
      v_profit_summary:      { Row: ProfitSummaryRow }
    }
    Functions: {
      complete_sale:     { Args: Record<string,unknown>; Returns: { sale_id: string; invoice_number: string }[] }
      complete_purchase: { Args: Record<string,unknown>; Returns: { purchase_id: string; invoice_number: string }[] }
      process_refund:    { Args: Record<string,unknown>; Returns: { refund_id: string; invoice_number: string }[] }
      pay_customer_debt: { Args: Record<string,unknown>; Returns: string }
      pay_supplier_debt: { Args: Record<string,unknown>; Returns: string }
      add_expense:       { Args: Record<string,unknown>; Returns: string }
    }
    Enums: {
      payment_method_enum:   PaymentMethod
      sale_status_enum:      SaleStatus
      purchase_status_enum:  PurchaseStatus
    }
  }
}

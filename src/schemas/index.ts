import { z } from 'zod'

// ── Product Schema ─────────────────────────────────────────────
export const productSchema = z.object({
  name_ar:               z.string().min(2, 'الاسم مطلوب').max(255),
  name_en:               z.string().max(255).optional().nullable(),
  scientific_name:       z.string().max(255).optional().nullable(),
  strength:              z.string().max(100).optional().nullable(),
  barcode:               z.string().max(50).optional().nullable(),
  category_id:           z.string().uuid().optional().nullable(),
  company_id:            z.string().uuid().optional().nullable(),
  dosage_form_id:        z.string().uuid().optional().nullable(),
  unit_id:               z.string().uuid().optional().nullable(),
  supplier_id:           z.string().uuid().optional().nullable(),
  purchase_price:        z.number().min(0, 'سعر التكلفة يجب أن يكون موجباً'),
  sale_price:            z.number().min(0, 'سعر البيع يجب أن يكون موجباً'),
  min_stock:             z.number().int().min(0),
  requires_prescription: z.boolean().default(false),
  notes:                 z.string().optional().nullable(),
}).refine((d) => d.sale_price >= d.purchase_price, {
  message: 'سعر البيع يجب أن يكون أكبر من أو يساوي سعر التكلفة',
  path:    ['sale_price'],
})

export type ProductFormData = z.infer<typeof productSchema>

// ── Customer Schema ────────────────────────────────────────────
export const customerSchema = z.object({
  name:  z.string().min(2, 'الاسم مطلوب').max(255),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable(),
})

export type CustomerFormData = z.infer<typeof customerSchema>

// ── Supplier Schema ────────────────────────────────────────────
export const supplierSchema = z.object({
  name:    z.string().min(2, 'الاسم مطلوب').max(255),
  phone:   z.string().max(20).optional().nullable(),
  email:   z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  notes:   z.string().optional().nullable(),
})

export type SupplierFormData = z.infer<typeof supplierSchema>

// ── Sale Schema ────────────────────────────────────────────────
export const saleSchema = z.object({
  customer_id:    z.string().uuid().optional().nullable(),
  discount:       z.number().min(0).default(0),
  tax:            z.number().min(0).default(0),
  paid_amount:    z.number().min(0),
  payment_method: z.enum(['cash', 'credit', 'deferred']),
  notes:          z.string().optional().nullable(),
})

export type SaleFormData = z.infer<typeof saleSchema>

// ── Purchase Item Schema ───────────────────────────────────────
export const purchaseItemSchema = z.object({
  product_id:   z.string().uuid('اختر منتجاً'),
  product_name: z.string(),
  batch_number: z.string().min(1, 'رقم التشغيلة مطلوب'),
  expiry_date:  z.string().min(1, 'تاريخ الصلاحية مطلوب'),
  quantity:     z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  buy_price:    z.number().min(0, 'سعر الشراء مطلوب'),
  sale_price:   z.number().min(0).optional(),
})

export const purchaseSchema = z.object({
  supplier_id:    z.string().uuid().optional().nullable(),
  items:          z.array(purchaseItemSchema).min(1, 'أضف منتجاً واحداً على الأقل'),
  paid_amount:    z.number().min(0).default(0),
  payment_method: z.enum(['cash', 'credit', 'deferred']),
  notes:          z.string().optional().nullable(),
})

export type PurchaseFormData  = z.infer<typeof purchaseSchema>
export type PurchaseItemData  = z.infer<typeof purchaseItemSchema>

// ── Debt Payment Schema ────────────────────────────────────────
export const debtPaymentSchema = z.object({
  amount:         z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  payment_method: z.enum(['cash', 'credit', 'deferred']),
  notes:          z.string().optional().nullable(),
})

export type DebtPaymentFormData = z.infer<typeof debtPaymentSchema>

// ── Expense Schema ─────────────────────────────────────────────
export const expenseSchema = z.object({
  category:     z.enum(['rent','salaries','utilities','maintenance','transport','marketing','supplies','other']),
  description:  z.string().min(2, 'الوصف مطلوب'),
  amount:       z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  expense_date: z.string(),
  notes:        z.string().optional().nullable(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

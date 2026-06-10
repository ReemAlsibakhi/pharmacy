import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer, Supplier, PaymentMethod } from '@/types/database'

// ── CUSTOMERS ─────────────────────────────────────────────────
const CUSTOMERS_KEY = 'customers'

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers').select('*').eq('is_deleted', false).order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Customer[]
}

async function createCustomer(payload: Record<string, unknown>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers').insert(payload as never).select().single()
  if (error) throw new Error(error.message)
  return data as unknown as Customer
}

async function updateCustomer(id: string, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('customers').update(payload as never).eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers').update({ is_deleted: true } as never).eq('id', id)
  if (error) throw new Error(error.message)
}

async function payCustomerDebt(
  customerId: string, amount: number,
  method: PaymentMethod, notes?: string
): Promise<void> {
  const { error } = await supabase.rpc('pay_customer_debt' as never, {
    p_customer_id:    customerId,
    p_amount:         amount,
    p_payment_method: method,
    p_user_id:        null,
    p_notes:          notes ?? null,
  } as never)
  if (error) throw new Error(error.message)
}

export function useCustomers() {
  return useQuery({ queryKey: [CUSTOMERS_KEY], queryFn: fetchCustomers })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Record<string, unknown>) => createCustomer(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...p }: { id: string } & Record<string, unknown>) => updateCustomer(id, p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  })
}

export function usePayCustomerDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, amount, method, notes }:
      { customerId: string; amount: number; method: PaymentMethod; notes?: string }) =>
      payCustomerDebt(customerId, amount, method, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  })
}

// ── SUPPLIERS ─────────────────────────────────────────────────
const SUPPLIERS_KEY = 'suppliers'

async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers').select('*').eq('is_deleted', false).order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Supplier[]
}

async function createSupplier(payload: Record<string, unknown>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers').insert(payload as never).select().single()
  if (error) throw new Error(error.message)
  return data as unknown as Supplier
}

async function updateSupplier(id: string, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('suppliers').update(payload as never).eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers').update({ is_deleted: true } as never).eq('id', id)
  if (error) throw new Error(error.message)
}

export function useSuppliers() {
  return useQuery({ queryKey: [SUPPLIERS_KEY], queryFn: fetchSuppliers })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Record<string, unknown>) => createSupplier(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...p }: { id: string } & Record<string, unknown>) => updateSupplier(id, p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }),
  })
}

// ── PURCHASES ─────────────────────────────────────────────────
const PURCHASES_KEY = 'purchases'

export interface CompletePurchasePayload {
  supplier_id:    string | null
  items:          Array<{
    product_id:   string
    product_name: string
    unit?:        string
    batch_number: string
    expiry_date:  string
    quantity:     number
    buy_price:    number
    sale_price?:  number
  }>
  paid_amount:    number
  payment_method: PaymentMethod
  notes?:         string | null
}

async function fetchPurchases() {
  const { data, error } = await supabase
    .from('v_purchases_report').select('*').order('purchase_date', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

async function fetchPurchaseDetails(id: string) {
  const { data, error } = await supabase
    .from('v_purchase_details').select('*').eq('purchase_id', id)
  if (error) throw new Error(error.message)
  return data ?? []
}

async function completePurchase(payload: CompletePurchasePayload) {
  const { data, error } = await supabase.rpc('complete_purchase' as never, {
    p_supplier_id:    payload.supplier_id,
    p_items:          payload.items,
    p_paid_amount:    payload.paid_amount,
    p_payment_method: payload.payment_method,
    p_user_id:        null,
    p_notes:          payload.notes ?? null,
  } as never)
  if (error) throw new Error(error.message)
  return (data as { purchase_id: string; invoice_number: string }[])?.[0]
}

export function usePurchases() {
  return useQuery({ queryKey: [PURCHASES_KEY], queryFn: fetchPurchases })
}

export function usePurchaseDetails(id: string | null) {
  return useQuery({
    queryKey: [PURCHASES_KEY, 'details', id],
    queryFn:  () => fetchPurchaseDetails(id!),
    enabled:  !!id,
  })
}

export function useCompletePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: completePurchase,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PURCHASES_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
    },
  })
}

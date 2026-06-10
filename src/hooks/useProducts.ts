import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

const QUERY_KEY = 'products'

// ── Fetch ──────────────────────────────────────────────────────
async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      company:companies(id, name),
      dosage_form:dosage_forms(id, code, name_ar),
      unit:units(id, name),
      supplier:suppliers(id, name, phone)
    `)
    .eq('is_active', true)
    .order('name_ar')

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Product[]
}

async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      dosage_form:dosage_forms(id, code, name_ar),
      unit:units(id, name),
      batches(*)
    `)
    .eq('barcode', barcode)
    .eq('is_active', true)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw new Error(error.message)
  return data as unknown as Product
}

async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Product
}

async function updateProduct(id: string, payload: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ── Hooks ──────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn:  fetchProducts,
  })
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'barcode', barcode],
    queryFn:  () => fetchProductByBarcode(barcode!),
    enabled:  !!barcode,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Product> & { id: string }) =>
      updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: [QUERY_KEY, 'inventory-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_inventory_report')
        .select('*')
        .order('name_ar')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useStockAlerts() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stock-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_stock_alerts')
        .select('*')
      if (error) throw new Error(error.message)
      return data ?? []
    },
    refetchInterval: 1000 * 60 * 5, // كل 5 دقائق
  })
}

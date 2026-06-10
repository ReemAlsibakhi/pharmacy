import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Sale, PaymentMethod } from '@/types/database'

const QUERY_KEY = 'sales'

export interface CompleteSalePayload {
  customer_id:    string | null
  items:          Array<{ product_id: string; batch_id?: string | null; quantity: number; sell_price: number }>
  discount:       number
  tax:            number
  paid_amount:    number
  payment_method: PaymentMethod
  user_id?:       string | null
  notes?:         string | null
}

async function fetchSales(limit = 50): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`*, customer:customers(id,name,phone), sale_items(*, product:products(name_ar))`)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Sale[]
}

async function completeSale(payload: CompleteSalePayload) {
  const { data, error } = await supabase.rpc('complete_sale' as never, {
    p_customer_id:    payload.customer_id,
    p_items:          payload.items,
    p_discount:       payload.discount,
    p_tax:            payload.tax,
    p_paid_amount:    payload.paid_amount,
    p_payment_method: payload.payment_method,
    p_user_id:        payload.user_id ?? null,
    p_notes:          payload.notes ?? null,
  } as never)
  if (error) throw new Error(error.message)
  return (data as { sale_id: string; invoice_number: string }[])?.[0]
}

export function useSales(limit = 50) {
  return useQuery({
    queryKey: [QUERY_KEY, { limit }],
    queryFn:  () => fetchSales(limit),
  })
}

export function useCompleteSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: completeSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDailySummary() {
  return useQuery({
    queryKey: ['reports', 'daily-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_daily_summary')
        .select('*')
        .order('sale_date', { ascending: false })
        .limit(30)
      if (error) throw new Error(error.message)
      return (data ?? []) as Record<string, unknown>[]
    },
  })
}

export function useProfitSummary(periodType: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  return useQuery({
    queryKey: ['reports', 'profit-summary', periodType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_profit_summary')
        .select('*')
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .limit(12)
      if (error) throw new Error(error.message)
      return (data ?? []) as Record<string, unknown>[]
    },
  })
}

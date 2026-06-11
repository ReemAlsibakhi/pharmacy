import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL
const supabaseKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars.')
}

// Typed client — for SELECT queries (full type safety)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

// Untyped client — for INSERT/UPDATE/RPC (bypasses Supabase SDK type bug with Partial<T>)
// Same connection, same auth — only difference is no generic type parameter
export const supabaseWrite = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export type SupabaseClient = typeof supabase

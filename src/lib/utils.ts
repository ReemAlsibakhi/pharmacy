import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** دمج Tailwind classes بأمان */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** تنسيق العملة */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-JO', {
    style:    'currency',
    currency: 'JOD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/** تنسيق التاريخ */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-JO', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  }).format(new Date(date))
}

/** تنسيق التاريخ والوقت */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-JO', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** تنسيق الأرقام */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ar-JO').format(n)
}

/** حساب الأيام المتبقية لتاريخ الصلاحية */
export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** حالة الصلاحية */
export function getExpiryStatus(expiryDate: string | null): {
  label: string
  color: 'danger' | 'warning' | 'success' | 'neutral'
} {
  if (!expiryDate) return { label: 'لا ينتهي', color: 'neutral' }
  const days = daysUntilExpiry(expiryDate)
  if (days < 0)   return { label: 'منتهي الصلاحية', color: 'danger' }
  if (days <= 7)  return { label: `${days} أيام`, color: 'danger' }
  if (days <= 30) return { label: `${days} يوم`, color: 'warning' }
  if (days <= 60) return { label: `${days} يوم`, color: 'warning' }
  return { label: formatDate(expiryDate), color: 'success' }
}

/** حالة المخزون */
export function getStockStatus(stock: number, minStock: number): {
  label: string
  color: 'danger' | 'warning' | 'success'
} {
  if (stock === 0)          return { label: 'نفد', color: 'danger' }
  if (stock <= minStock)    return { label: 'منخفض', color: 'warning' }
  return { label: 'متوفر', color: 'success' }
}

/** اختصار النص الطويل */
export function truncate(text: string, length = 30): string {
  return text.length > length ? `${text.slice(0, length)}...` : text
}

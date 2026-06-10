import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from './Modal'
import { Button } from './Button'

// ── Badge ──────────────────────────────────────────────────────
type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const badgeColors: Record<BadgeColor, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-800',
  info:    'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
}

interface BadgeProps {
  children: React.ReactNode
  color?:   BadgeColor
  className?: string
}

export function Badge({ children, color = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeColors[color],
      className
    )}>
      {children}
    </span>
  )
}

// ── Spinner ────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-primary-600', spinnerSizes[size], className)} />
  )
}

// ── PageLoader ─────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────
interface EmptyStateProps {
  icon?:        LucideIcon
  title:        string
  description?: string
  action?:      React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── ConfirmDialog ──────────────────────────────────────────────
interface ConfirmDialogProps {
  open:       boolean
  onClose:    () => void
  onConfirm:  () => void
  title:      string
  message:    string
  confirmLabel?: string
  danger?:    boolean
  loading?:   boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm,
  title, message, confirmLabel = 'تأكيد', danger = false, loading
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>إلغاء</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        {danger && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </Modal>
  )
}

// ── ErrorMessage ───────────────────────────────────────────────
interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'حدث خطأ غير متوقع', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <p className="text-sm text-gray-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  )
}

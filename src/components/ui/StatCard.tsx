import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title:      string
  value:      string | number
  subtitle?:  string
  icon:       LucideIcon
  iconColor?: string
  trend?:     { value: number; label: string }
  loading?:   boolean
}

export function StatCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-primary-600',
  trend, loading
}: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn(
        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50',
      )}>
        <Icon className={cn('w-6 h-6', iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>

        {loading ? (
          <div className="mt-1 h-7 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-gray-900 truncate">{value}</p>
        )}

        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{subtitle}</p>
        )}

        {trend && (
          <div className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}

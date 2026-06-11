import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title:      string
  value:      string | number
  subtitle?:  string
  icon:       LucideIcon
  iconBg?:    string
  iconColor?: string
  trend?:     { value: number; label: string }
  loading?:   boolean
}

export function StatCard({
  title, value, subtitle,
  icon: Icon,
  iconBg    = 'bg-primary-50',
  iconColor = 'text-primary-600',
  trend,
  loading,
}: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0

  if (loading) {
    return (
      <div className="card p-4 md:p-5 flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gray-100 animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 md:p-5 flex items-start gap-3 md:gap-4 hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center',
        iconBg
      )}>
        <Icon className={cn('w-5 h-5 md:w-6 md:h-6', iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm text-gray-500 truncate">{title}</p>
        <p className="mt-0.5 text-xl md:text-2xl font-bold text-gray-900 truncate leading-tight">
          {value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{subtitle}</p>
        )}
        {trend && (
          <div className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive
              ? <TrendingUp  className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}

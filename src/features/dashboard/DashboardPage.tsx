import { ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard }       from '@/components/ui/StatCard'
import { PageLoader, ErrorMessage } from '@/components/ui/index'
import { useDailySummary } from '@/hooks/useSales'
import { useStockAlerts }  from '@/hooks/useProducts'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useDailySummary()
  const { data: alerts, isLoading: loadingAlerts } = useStockAlerts()

  if (isLoading) return <PageLoader />
  if (error)     return <ErrorMessage message="تعذر تحميل البيانات" />

  const today     = summary?.[0]
  const alertCount = alerts?.length ?? 0

  const chartData = (summary ?? []).slice(0, 14).reverse().map((d) => ({
    date:    formatDate(String(d['sale_date'])),
    revenue: Number(d['total_revenue']) || 0,
    profit:  Number(d['gross_profit'])  || 0,
  }))

  return (
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مبيعات اليوم"
          value={formatCurrency(Number(today?.['total_revenue']) || 0)}
          subtitle={`${today?.['total_invoices'] ?? 0} فاتورة`}
          icon={ShoppingCart} iconColor="text-blue-600"
        />
        <StatCard
          title="الربح الإجمالي"
          value={formatCurrency(Number(today?.['gross_profit']) || 0)}
          icon={TrendingUp} iconColor="text-green-600"
        />
        <StatCard
          title="المحصّل نقداً"
          value={formatCurrency(Number(today?.['cash_collected']) || 0)}
          icon={DollarSign} iconColor="text-emerald-600"
        />
        <StatCard
          title="تنبيهات المخزون"
          value={alertCount}
          subtitle={alertCount > 0 ? 'تحتاج مراجعة' : 'كل شيء طبيعي'}
          icon={AlertTriangle}
          iconColor={alertCount > 0 ? 'text-red-500' : 'text-gray-400'}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-gray-900">المبيعات والأرباح (14 يوم)</h2>
        </div>
        <div className="card-body h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#revenue)" name="المبيعات" />
              <Area type="monotone" dataKey="profit"  stroke="#22c55e" fill="url(#profit)"  name="الأرباح" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alertCount > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              تنبيهات المخزون ({alertCount})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {(loadingAlerts ? Array(3).fill(null) : alerts ?? []).slice(0, 8).map((alert, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between gap-4">
                {!alert ? (
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{String((alert as Record<string,unknown>)['name_ar'])}</p>
                      <p className="text-xs text-gray-500">مخزون: {String((alert as Record<string,unknown>)['stock'])} — الحد: {String((alert as Record<string,unknown>)['min_stock'])}</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {((alert as Record<string,unknown>)['alert_types'] as string[]).map((type) => (
                        <span key={type} className="badge-danger text-xs px-2 py-0.5 rounded-full">
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

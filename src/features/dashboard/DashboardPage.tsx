import {
  ShoppingCart, TrendingUp, AlertTriangle, DollarSign,
  Package, ArrowLeft
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { StatCard }        from '@/components/ui/StatCard'
import { ErrorMessage }    from '@/components/ui/index'
import { useDailySummary } from '@/hooks/useSales'
import { useStockAlerts }  from '@/hooks/useProducts'
import { formatCurrency, formatDate } from '@/lib/utils'

// ── Skeleton للـ chart ──────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="h-64 w-full bg-gray-50 rounded-xl animate-pulse flex items-end gap-2 p-4">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  )
}

// ── Tooltip مخصص ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary, error } = useDailySummary()
  const { data: alerts,  isLoading: loadingAlerts }         = useStockAlerts()

  const today      = summary?.[0]
  const alertCount = alerts?.length ?? 0

  const chartData = (summary ?? [])
    .slice(0, 14)
    .reverse()
    .map((d) => ({
      date:    formatDate(String(d['sale_date'])),
      revenue: Number(d['total_revenue']) || 0,
      profit:  Number(d['gross_profit'])  || 0,
    }))

  if (error) return <ErrorMessage message="تعذر تحميل بيانات الرئيسية" />

  return (
    <div className="page-container">

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          loading={loadingSummary}
          title="مبيعات اليوم"
          value={formatCurrency(Number(today?.['total_revenue']) || 0)}
          subtitle={`${today?.['total_invoices'] ?? 0} فاتورة`}
          icon={ShoppingCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          loading={loadingSummary}
          title="الربح الإجمالي"
          value={formatCurrency(Number(today?.['gross_profit']) || 0)}
          subtitle="بعد خصم التكلفة"
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          loading={loadingSummary}
          title="المحصّل نقداً"
          value={formatCurrency(Number(today?.['cash_collected']) || 0)}
          subtitle="مدفوعات اليوم"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          loading={loadingAlerts}
          title="تنبيهات المخزون"
          value={alertCount}
          subtitle={alertCount > 0 ? 'تحتاج مراجعة' : 'كل شيء طبيعي'}
          icon={AlertTriangle}
          iconBg={alertCount > 0 ? 'bg-red-50'  : 'bg-gray-50'}
          iconColor={alertCount > 0 ? 'text-red-500' : 'text-gray-400'}
        />
      </div>

      {/* ── Chart ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900">
              المبيعات والأرباح
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">آخر 14 يوم</p>
          </div>
        </div>
        <div className="card-body !p-4 md:!p-6">
          {loadingSummary ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Package className="w-10 h-10" />
              <p className="text-sm">لا توجد مبيعات بعد</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    reversed={true}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="المبيعات"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#gradRevenue)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="الأرباح"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#gradProfit)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Stock Alerts ── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <h2 className="text-sm md:text-base font-semibold text-gray-900">
              تنبيهات المخزون
            </h2>
            {alertCount > 0 && (
              <span className="badge-danger text-xs">{alertCount}</span>
            )}
          </div>
          {alertCount > 0 && (
            <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
              عرض الكل
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Loading */}
        {loadingAlerts && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loadingAlerts && alertCount === 0 && (
          <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600">المخزون في حالة ممتازة</p>
            <p className="text-xs">لا توجد تنبيهات حالياً</p>
          </div>
        )}

        {/* Alerts list */}
        {!loadingAlerts && alertCount > 0 && (
          <div className="divide-y divide-gray-100">
            {(alerts ?? []).slice(0, 8).map((alert, i) => {
              const row       = alert as Record<string, unknown>
              const types     = (row['alert_types'] as string[]) ?? []
              const isExpired = types.includes('منتهي_الصلاحية')
              const isLow     = types.includes('مخزون_منخفض')

              return (
                <div key={i} className="px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {String(row['name_ar'])}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      مخزون: <span className="font-medium text-gray-600">{String(row['stock'])}</span>
                      {' · '}
                      الحد الأدنى: <span className="font-medium text-gray-600">{String(row['min_stock'])}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {isExpired && <span className="badge-danger text-xs">منتهي</span>}
                    {isLow     && <span className="badge-warning text-xs">منخفض</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

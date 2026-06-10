import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useProfitSummary } from '@/hooks/useSales'
import { Button }     from '@/components/ui/Button'
import { StatCard }   from '@/components/ui/StatCard'
import { PageLoader } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly'
type Row = Record<string, unknown>

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly')
  const { data, isLoading } = useProfitSummary(period)

  if (isLoading) return <PageLoader />

  const latest  = (data?.[0] as Row | undefined)
  const netProfit = Number(latest?.['net_profit'] ?? 0)

  const chartData = (data ?? []).slice(0, 12).reverse().map((r) => {
    const row = r as Row
    return {
      label:    String(row['period_label'] ?? ''),
      revenue:  Number(row['total_revenue']          ?? 0),
      gross:    Number(row['gross_profit']            ?? 0),
      expenses: Number(row['operational_expenses']    ?? 0),
      net:      Number(row['net_profit']              ?? 0),
    }
  })

  return (
    <div className="page-container">
      <div className="flex gap-2">
        {(['daily','weekly','monthly'] as Period[]).map((p) => (
          <Button key={p} variant={period === p ? 'primary' : 'secondary'} size="sm" onClick={() => setPeriod(p)}>
            {{ daily:'يومي', weekly:'أسبوعي', monthly:'شهري' }[p]}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الإيراد"            value={formatCurrency(Number(latest?.['total_revenue'] ?? 0))}          icon={DollarSign}   iconColor="text-blue-600" />
        <StatCard title="الربح الإجمالي"     value={formatCurrency(Number(latest?.['gross_profit'] ?? 0))}           icon={TrendingUp}   iconColor="text-green-600" />
        <StatCard title="المصاريف التشغيلية" value={formatCurrency(Number(latest?.['operational_expenses'] ?? 0))}   icon={ShoppingCart} iconColor="text-orange-500" />
        <StatCard title="صافي الربح"         value={formatCurrency(netProfit)}
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          iconColor={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm justify-center">
          {[
            { label: 'الإيراد',          value: Number(latest?.['total_revenue']         ?? 0), color: 'text-blue-600' },
            { label: '− تكلفة البضاعة',   value: Number(latest?.['total_cogs']            ?? 0), color: 'text-gray-500' },
            { label: '= ربح إجمالي',      value: Number(latest?.['gross_profit']          ?? 0), color: 'text-green-600' },
            { label: '− مصاريف',          value: Number(latest?.['operational_expenses']  ?? 0), color: 'text-orange-500' },
            { label: '− مرتجعات',         value: Number(latest?.['total_refunds']         ?? 0), color: 'text-red-500' },
            { label: '= صافي الربح',      value: netProfit,                                       color: 'text-emerald-700 font-bold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="text-gray-500">{label}</span>
              <span className={`font-mono font-medium ${color}`}>{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-gray-900">تحليل الأرباح</h2>
        </div>
        <div className="card-body h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="revenue"  name="الإيراد"        fill="#0ea5e9" radius={[4,4,0,0]} />
              <Bar dataKey="gross"    name="الربح الإجمالي" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="المصاريف"       fill="#f97316" radius={[4,4,0,0]} />
              <Bar dataKey="net"      name="صافي الربح"     fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

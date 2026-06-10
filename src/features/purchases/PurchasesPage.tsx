import { useState } from 'react'
import { Plus, Search, Package } from 'lucide-react'
import { usePurchases, useCompletePurchase } from '@/hooks/useEntities'
import { useSuppliers } from '@/hooks/useEntities'
import { useProducts }  from '@/hooks/useProducts'
import { Button }       from '@/components/ui/Button'
import { Input }        from '@/components/ui/Input'
import { Select }       from '@/components/ui/Select'
import { Modal }        from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, PageLoader, ErrorMessage } from '@/components/ui/index'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { purchaseSchema, type PurchaseFormData } from '@/schemas'
import type { Purchase, PaymentMethod } from '@/types/database'

export default function PurchasesPage() {
  const { data, isLoading, error } = usePurchases()
  const { data: suppliers }        = useSuppliers()
  const { data: products }         = useProducts()
  const completePurchase           = useCompletePurchase()

  const [search,     setSearch]     = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { register, handleSubmit, control, reset, watch, formState: { errors } } =
    useForm<PurchaseFormData>({
      resolver: zodResolver(purchaseSchema),
      defaultValues: { items: [{ product_id:'', product_name:'', batch_number:'', expiry_date:'', quantity:1, buy_price:0 }], paid_amount:0, payment_method:'cash' },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')
  const total = watchItems.reduce((s, i) => s + (i.quantity * i.buy_price || 0), 0)

  const columns: Column<Purchase & Record<string,unknown>>[] = [
    { key: 'invoice_number', header: 'رقم الفاتورة', render: (r) => <span className="font-mono text-xs">{String(r.invoice_number)}</span> },
    { key: 'purchase_date',  header: 'التاريخ', render: (r) => formatDate(String(r.purchase_date ?? r.created_at)) },
    { key: 'supplier_name',  header: 'المورد', render: (r) => String(r.supplier_name ?? '—') },
    { key: 'total_amount',   header: 'الإجمالي', render: (r) => formatCurrency(Number(r.total_amount)) },
    {
      key: 'remaining', header: 'المتبقي',
      render: (r) => {
        const rem = Number(r.remaining_amount ?? (Number(r.total_amount) - Number(r.paid_amount)))
        return rem > 0 ? <Badge color="warning">{formatCurrency(rem)}</Badge> : <Badge color="success">مدفوع</Badge>
      },
    },
    {
      key: 'status', header: 'الحالة',
      render: (r) => <Badge color={r.status === 'paid' ? 'success' : r.status === 'partial' ? 'warning' : 'danger'}>
        {String(r.status_ar ?? r.status)}
      </Badge>,
    },
  ]

  const filtered = (data ?? []).filter((p: Purchase & Record<string,unknown>) =>
    String(p.invoice_number).includes(search)
  )

  if (isLoading) return <PageLoader />
  if (error)     return <ErrorMessage />

  return (
    <div className="page-container">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="بحث برقم الفاتورة..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search className="w-4 h-4"/>} className="max-w-sm" />
        <Button icon={<Plus className="w-4 h-4"/>} onClick={() => setCreateOpen(true)}>فاتورة شراء</Button>
      </div>

      <Table columns={columns} data={filtered as never} keyField="id" emptyMessage="لا توجد مشتريات" />

      {/* New Purchase Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }}
        title="فاتورة شراء جديدة" size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>إلغاء</Button>
            <Button loading={completePurchase.isPending}
              onClick={handleSubmit(async (d) => {
                await completePurchase.mutateAsync({
                  ...d,
                  items: d.items.map((i) => ({
                    ...i,
                    product_name: products?.find((p) => p.id === i.product_id)?.name_ar ?? i.product_id,
                  })),
                })
                setCreateOpen(false); reset()
              })}>
              حفظ الفاتورة
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="المورد" placeholder="اختر مورداً..."
              options={(suppliers ?? []).map((s) => ({ value: s.id, label: s.name }))}
              {...register('supplier_id')}
            />
            <Select
              label="طريقة الدفع"
              options={[{value:'cash',label:'نقد'},{value:'credit',label:'بطاقة'},{value:'deferred',label:'آجل'}]}
              {...register('payment_method')}
            />
            <Input label="المبلغ المدفوع" type="number" step="0.01"
              {...register('paid_amount', { valueAsNumber: true })} />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">الأصناف</h3>
              <Button variant="secondary" size="sm" icon={<Plus className="w-3 h-3"/>}
                onClick={() => append({ product_id:'', product_name:'', batch_number:'', expiry_date:'', quantity:1, buy_price:0 })}>
                إضافة صنف
              </Button>
            </div>

            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-6 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                <div className="col-span-2">
                  <Select
                    label="المنتج" placeholder="اختر..."
                    options={(products ?? []).map((p) => ({ value: p.id, label: p.name_ar }))}
                    {...register(`items.${i}.product_id`)}
                    error={errors.items?.[i]?.product_id?.message}
                  />
                </div>
                <Input label="رقم التشغيلة" {...register(`items.${i}.batch_number`)} placeholder="BAT-001" />
                <Input label="الصلاحية" type="date" {...register(`items.${i}.expiry_date`)} />
                <Input label="الكمية"  type="number" {...register(`items.${i}.quantity`,  { valueAsNumber: true })} />
                <div className="flex gap-2 items-end">
                  <Input label="سعر الشراء" type="number" step="0.01" {...register(`items.${i}.buy_price`, { valueAsNumber: true })} />
                  {fields.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => remove(i)} className="mb-0.5 flex-shrink-0">
                      <span className="text-red-400 text-lg leading-none">×</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-2 border-t font-bold">
            <span className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" />الإجمالي</span>
            <span className="text-primary-600 text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

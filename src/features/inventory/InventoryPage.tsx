import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useInventoryReport, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { Button }    from '@/components/ui/Button'
import { Input }     from '@/components/ui/Input'
import { Modal }     from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, ConfirmDialog, ErrorMessage, PageLoader } from '@/components/ui/index'
import { formatCurrency, formatDate } from '@/lib/utils'
import { productSchema, type ProductFormData } from '@/schemas'
import type { InventoryReportRow } from '@/types/database'

function ProductForm({ defaultValues, onSubmit, loading }: {
  defaultValues?: Partial<ProductFormData>
  onSubmit: (d: ProductFormData) => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { purchase_price: 0, sale_price: 0, min_stock: 5, requires_prescription: false, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="الاسم العربي" {...register('name_ar')} error={errors.name_ar?.message} required />
        </div>
        <Input label="الاسم الإنجليزي" {...register('name_en')} />
        <Input label="المادة العلمية"  {...register('scientific_name')} />
        <Input label="التركيز (500mg)" {...register('strength')} />
        <Input label="الباركود" {...register('barcode')} className="font-mono" />
        <Input label="سعر التكلفة" type="number" step="0.01" {...register('purchase_price', { valueAsNumber: true })} error={errors.purchase_price?.message} required />
        <Input label="سعر البيع"   type="number" step="0.01" {...register('sale_price',     { valueAsNumber: true })} error={errors.sale_price?.message}    required />
        <Input label="حد التنبيه"  type="number" {...register('min_stock', { valueAsNumber: true })} />
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="rx" {...register('requires_prescription')} className="w-4 h-4 rounded text-primary-600" />
          <label htmlFor="rx" className="text-sm text-gray-700">يحتاج وصفة طبية</label>
        </div>
        <div className="col-span-2"><Input label="ملاحظات" {...register('notes')} /></div>
      </div>
      {errors.sale_price?.message && <p className="text-xs text-red-600">{errors.sale_price.message}</p>}
      <div className="flex justify-end"><Button type="submit" loading={loading}>حفظ</Button></div>
    </form>
  )
}

export default function InventoryPage() {
  const { data, isLoading, error, refetch } = useInventoryReport()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [search,      setSearch]      = useState('')
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editRow,     setEditRow]     = useState<InventoryReportRow | null>(null)
  const [deleteRow,   setDeleteRow]   = useState<InventoryReportRow | null>(null)

  const filtered = (data ?? []).filter((p) =>
    p.name_ar.includes(search) ||
    (p.scientific_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode ?? '').includes(search)
  )

  const columns: Column<InventoryReportRow>[] = [
    {
      key: 'name_ar', header: 'المنتج',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.name_ar}</p>
          {r.scientific_name && <p className="text-xs text-gray-400">{r.scientific_name}</p>}
          {r.strength         && <p className="text-xs text-gray-400">{r.strength}</p>}
        </div>
      ),
    },
    { key: 'dosage_form', header: 'الشكل', render: (r) => r.dosage_form ?? '—' },
    {
      key: 'default_cost', header: 'التكلفة / البيع',
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">{formatCurrency(r.default_cost)}</p>
          <p className="font-medium text-primary-600">{formatCurrency(r.default_price)}</p>
        </div>
      ),
    },
    {
      key: 'stock', header: 'المخزون',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className={`font-medium ${r.stock <= r.min_stock ? 'text-red-600' : 'text-gray-900'}`}>{r.stock}</span>
          {r.stock <= r.min_stock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      ),
    },
    {
      key: 'nearest_expiry', header: 'الصلاحية',
      render: (r) => r.nearest_expiry
        ? <span className={r.stock_status === 'نفد' ? 'text-red-600 font-medium' : 'text-gray-600'}>{formatDate(r.nearest_expiry)}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'requires_prescription', header: 'وصفة',
      render: (r) => r.requires_prescription ? <Badge color="warning">نعم</Badge> : null,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditRow(r)}><Edit2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteRow(r)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageLoader />
  if (error)     return <ErrorMessage message="تعذر تحميل المخزون" onRetry={refetch} />

  return (
    <div className="page-container">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="بحث بالاسم أو الباركود..." value={search}
          onChange={(e) => setSearch(e.target.value)} prefix={<Search className="w-4 h-4" />} className="max-w-sm" />
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>منتج جديد</Button>
      </div>

      <Table columns={columns} data={filtered} keyField="id" emptyMessage="لا توجد منتجات" />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="إضافة منتج" size="lg">
        <ProductForm
          onSubmit={async (d) => {
            await createProduct.mutateAsync(d as Record<string, unknown>)
            setCreateOpen(false)
          }}
          loading={createProduct.isPending}
        />
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="تعديل المنتج" size="lg">
        {editRow && (
          <ProductForm
            defaultValues={{
              name_ar:         editRow.name_ar,
              name_en:         editRow.name_en ?? undefined,
              scientific_name: editRow.scientific_name ?? undefined,
              purchase_price:  editRow.default_cost,
              sale_price:      editRow.default_price,
              min_stock:       editRow.min_stock,
            }}
            onSubmit={async (d) => {
              await updateProduct.mutateAsync({ id: editRow.id, ...d } as { id: string } & Record<string, unknown>)
              setEditRow(null)
            }}
            loading={updateProduct.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteRow} onClose={() => setDeleteRow(null)}
        onConfirm={async () => {
          if (deleteRow) { await deleteProduct.mutateAsync(deleteRow.id); setDeleteRow(null) }
        }}
        title="حذف المنتج"
        message={`هل أنت متأكد من حذف "${deleteRow?.name_ar}"؟`}
        confirmLabel="حذف" danger loading={deleteProduct.isPending}
      />
    </div>
  )
}

import { useState } from 'react'
import { Plus, Search, Phone } from 'lucide-react'
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from '@/hooks/useEntities'
import { Button }  from '@/components/ui/Button'
import { Input }   from '@/components/ui/Input'
import { Modal }   from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, PageLoader, ErrorMessage, ConfirmDialog } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, type SupplierFormData } from '@/schemas'
import type { Supplier } from '@/types/database'

export default function SuppliersPage() {
  const { data, isLoading, error } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [search,     setSearch]     = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [toDelete,   setToDelete]   = useState<Supplier | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  })

  const filtered = (data ?? []).filter((s) =>
    s.name.includes(search) || s.phone?.includes(search)
  )

  const columns: Column<Supplier>[] = [
    { key: 'name', header: 'المورد' },
    {
      key: 'phone', header: 'الهاتف',
      render: (r) => r.phone
        ? <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-primary-600 hover:underline"><Phone className="w-3 h-3"/>{r.phone}</a>
        : <span className="text-gray-300">—</span>,
    },
    { key: 'address', header: 'العنوان', render: (r) => r.address ?? '—' },
    {
      key: 'balance', header: 'المستحق',
      render: (r) => r.balance > 0
        ? <Badge color="warning">{formatCurrency(r.balance)}</Badge>
        : <Badge color="neutral">لا يوجد</Badge>,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <Button variant="ghost" size="icon" onClick={() => setToDelete(r)}>
          <span className="text-red-400 text-xs">حذف</span>
        </Button>
      ),
    },
  ]

  if (isLoading) return <PageLoader />
  if (error)     return <ErrorMessage />

  return (
    <div className="page-container">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="بحث..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search className="w-4 h-4"/>} className="max-w-sm" />
        <Button icon={<Plus className="w-4 h-4"/>} onClick={() => setCreateOpen(true)}>مورد جديد</Button>
      </div>

      <Table columns={columns} data={filtered} keyField="id" emptyMessage="لا يوجد موردون" />

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="إضافة مورد" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>إلغاء</Button>
            <Button loading={createSupplier.isPending}
              onClick={handleSubmit(async (d) => {
                await createSupplier.mutateAsync(d as never)
                setCreateOpen(false); reset()
              })}>حفظ</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="الاسم" {...register('name')} error={errors.name?.message} required />
          <Input label="الهاتف"   {...register('phone')} />
          <Input label="العنوان"  {...register('address')} />
          <Input label="البريد"   {...register('email')} />
          <Input label="ملاحظات" {...register('notes')} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={async () => { if (toDelete) { await deleteSupplier.mutateAsync(toDelete.id); setToDelete(null) } }}
        title="حذف المورد" message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
        confirmLabel="حذف" danger loading={deleteSupplier.isPending}
      />
    </div>
  )
}

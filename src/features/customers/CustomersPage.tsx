// ================================================================
// Customers Page
// ================================================================
import { useState } from 'react'
import { Plus, Search, Phone, CreditCard } from 'lucide-react'
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '@/hooks/useEntities'
import { Button }      from '@/components/ui/Button'
import { Input }       from '@/components/ui/Input'
import { Modal }       from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, PageLoader, ErrorMessage, ConfirmDialog } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/schemas'
import type { Customer } from '@/types/database'

export default function CustomersPage() {
  const { data, isLoading, error } = useCustomers()
  const createCustomer = useCreateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [search,     setSearch]     = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [toDelete,   setToDelete]   = useState<Customer | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  const filtered = (data ?? []).filter((c) =>
    c.name.includes(search) || c.phone?.includes(search)
  )

  const columns: Column<Customer>[] = [
    { key: 'name',  header: 'الاسم' },
    {
      key: 'phone', header: 'الهاتف',
      render: (r) => r.phone
        ? <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-primary-600 hover:underline"><Phone className="w-3 h-3" />{r.phone}</a>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'debt', header: 'الدين',
      render: (r) => r.debt > 0
        ? <Badge color="danger">{formatCurrency(r.debt)}</Badge>
        : <Badge color="success">لا يوجد</Badge>,
    },
    {
      key: 'total_spent', header: 'إجمالي المشتريات',
      render: (r) => <span className="font-medium">{formatCurrency(r.total_spent)}</span>,
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
        <Input placeholder="بحث بالاسم أو الهاتف..." value={search}
          onChange={(e) => setSearch(e.target.value)} prefix={<Search className="w-4 h-4" />} className="max-w-sm" />
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>عميل جديد</Button>
      </div>

      <Table columns={columns} data={filtered} keyField="id" emptyMessage="لا يوجد عملاء" />

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="إضافة عميل" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>إلغاء</Button>
            <Button
              loading={createCustomer.isPending}
              onClick={handleSubmit(async (d) => {
                await createCustomer.mutateAsync(d as never)
                setCreateOpen(false); reset()
              })}
            >حفظ</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="الاسم" {...register('name')} error={errors.name?.message} required />
          <Input label="الهاتف" {...register('phone')} />
          <Input label="البريد الإلكتروني" {...register('email')} />
          <Input label="ملاحظات" {...register('notes')} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={async () => { if (toDelete) { await deleteCustomer.mutateAsync(toDelete.id); setToDelete(null) } }}
        title="حذف العميل" message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
        confirmLabel="حذف" danger loading={deleteCustomer.isPending}
      />
    </div>
  )
}

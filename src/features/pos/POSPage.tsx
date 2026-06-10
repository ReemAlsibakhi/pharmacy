import { useState, useCallback } from 'react'
import { Camera, Search, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCartStore }     from '@/store/useCartStore'
import { useProducts }      from '@/hooks/useProducts'
import { useCompleteSale }  from '@/hooks/useSales'
import { useBarcodeInput }  from '@/hooks/useBarcodeInput'
import { BarcodeScanner }   from './BarcodeScanner'
import { Button }           from '@/components/ui/Button'
import { Input }            from '@/components/ui/Input'
import { Modal }            from '@/components/ui/Modal'
import { PageLoader, ErrorMessage } from '@/components/ui/index'
import { formatCurrency }   from '@/lib/utils'
import type { Product, PaymentMethod } from '@/types/database'

// ── Product Grid ────────────────────────────────────────────────
function ProductGrid({
  products, onAdd
}: { products: Product[]; onAdd: (p: Product) => void }) {
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) =>
    p.name_ar.includes(search) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.scientific_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  )

  return (
    <div className="flex flex-col h-full gap-3">
      <Input
        placeholder="بحث بالاسم أو الباركود..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<Search className="w-4 h-4" />}
      />
      <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2 content-start">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => onAdd(product)}
            disabled={product.stock === 0}
            className="text-right p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
              {product.name_ar}
            </p>
            {product.strength && (
              <p className="text-xs text-gray-400 mt-0.5">{product.strength}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-primary-600 font-bold text-sm">
                {formatCurrency(product.sale_price)}
              </span>
              <span className={`text-xs ${product.stock <= product.min_stock ? 'text-red-500' : 'text-gray-400'}`}>
                {product.stock}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            لا توجد نتائج
          </div>
        )}
      </div>
    </div>
  )
}

// ── Checkout Modal ──────────────────────────────────────────────
function CheckoutModal({
  open, onClose, onConfirm, total, loading
}: {
  open: boolean; onClose: () => void
  onConfirm: (d: { discount: number; paid: number; method: PaymentMethod }) => void
  total: number; loading: boolean
}) {
  const [discount, setDiscount] = useState(0)
  const [paid,     setPaid]     = useState(total)
  const [method,   setMethod]   = useState<PaymentMethod>('cash')
  const net = total - discount

  return (
    <Modal open={open} onClose={onClose} title="إتمام البيع" size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button
            onClick={() => onConfirm({ discount, paid, method })}
            loading={loading}
            disabled={method === 'cash' && paid < net}
          >
            تأكيد البيع
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">الإجمالي</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(net)}</p>
        </div>

        <Input
          label="خصم"
          type="number" min={0} max={total}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          suffix={<span className="text-xs">د.أ</span>}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
          <div className="grid grid-cols-3 gap-2">
            {([['cash','نقد'],['credit','بطاقة'],['deferred','آجل']] as [PaymentMethod,string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setMethod(v)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  method === v
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {method === 'cash' && (
          <Input
            label="المبلغ المدفوع"
            type="number" min={net}
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value))}
          />
        )}

        {method === 'cash' && paid > net && (
          <div className="bg-green-50 rounded-lg px-4 py-2 flex justify-between text-sm">
            <span className="text-gray-600">الباقي</span>
            <span className="font-bold text-green-600">{formatCurrency(paid - net)}</span>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── POS Page ───────────────────────────────────────────────────
export default function POSPage() {
  const { data: products, isLoading, error } = useProducts()
  const cart      = useCartStore()
  const complete  = useCompleteSale()

  const [scannerOpen,  setScannerOpen]  = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [manualCode,   setManualCode]   = useState('')

  const handleScan = useCallback((barcode: string) => {
    const product = products?.find((p) => p.barcode === barcode)
    if (product) cart.addItem(product)
    else alert(`لم يُعثر على منتج بالباركود: ${barcode}`)
  }, [products, cart])

  useBarcodeInput({ onScan: handleScan })

  const handleManualBarcode = () => {
    if (manualCode) { handleScan(manualCode); setManualCode('') }
  }

  const handleCheckout = async (opts: { discount: number; paid: number; method: PaymentMethod }) => {
    await complete.mutateAsync({
      customer_id:    cart.customerId,
      items:          cart.items.map((i) => ({
        product_id:  i.product.id,
        batch_id:    i.batch?.id ?? null,
        quantity:    i.quantity,
        sell_price:  i.sell_price,
      })),
      discount:       opts.discount,
      tax:            0,
      paid_amount:    opts.paid,
      payment_method: opts.method,
    })
    cart.clearCart()
    setCheckoutOpen(false)
  }

  if (isLoading) return <PageLoader />
  if (error)     return <ErrorMessage message="تعذر تحميل المنتجات" />

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Products panel */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Barcode bar */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="أدخل الباركود..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualBarcode()}
            className="font-mono"
          />
          <Button
            variant="secondary"
            icon={<Camera className="w-4 h-4" />}
            onClick={() => setScannerOpen(true)}
          >
            مسح
          </Button>
        </div>

        <ProductGrid products={products ?? []} onAdd={(p) => cart.addItem(p)} />
      </div>

      {/* Cart panel */}
      <div className="w-72 lg:w-80 flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">
            السلة ({cart.itemsCount()})
          </span>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-sm">السلة فارغة</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={`${item.product.id}-${item.batch?.id}`} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 leading-tight flex-1">
                    {item.product.name_ar}
                  </p>
                  <button
                    onClick={() => cart.removeItem(item.product.id, item.batch?.id ?? null)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cart.updateQuantity(item.product.id, item.batch?.id ?? null, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.product.id, item.batch?.id ?? null, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary-600">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-base font-bold">
            <span className="text-gray-900">الإجمالي</span>
            <span className="text-primary-600">{formatCurrency(cart.totalAmount())}</span>
          </div>
          <Button
            className="w-full"
            disabled={cart.items.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            إتمام البيع
          </Button>
          {cart.items.length > 0 && (
            <Button variant="ghost" size="sm" className="w-full" onClick={cart.clearCart}>
              مسح السلة
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleCheckout}
        total={cart.totalAmount()}
        loading={complete.isPending}
      />
    </div>
  )
}

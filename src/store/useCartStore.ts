import { create } from 'zustand'
import type { Product, Batch } from '@/types/database'

export interface CartItem {
  product:    Product
  batch:      Batch | null
  quantity:   number
  sell_price: number   // سعر البيع الفعلي (قد يختلف عن سعر المنتج)
  subtotal:   number
}

interface CartStore {
  items:       CartItem[]
  customerId:  string | null
  discount:    number
  notes:       string

  // Actions
  addItem:          (product: Product, batch?: Batch | null) => void
  removeItem:       (productId: string, batchId?: string | null) => void
  updateQuantity:   (productId: string, batchId: string | null, qty: number) => void
  updatePrice:      (productId: string, batchId: string | null, price: number) => void
  setCustomer:      (id: string | null) => void
  setDiscount:      (amount: number) => void
  setNotes:         (notes: string) => void
  clearCart:        () => void

  // Computed
  totalAmount:  () => number
  netAmount:    () => number
  itemsCount:   () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items:      [],
  customerId: null,
  discount:   0,
  notes:      '',

  addItem: (product, batch = null) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.product.id === product.id &&
               (batch ? i.batch?.id === batch.id : i.batch === null)
      )

      const sell_price = batch ? batch.sale_price : product.sale_price

      if (existing) {
        return {
          items: state.items.map((i) =>
            i === existing
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.sell_price }
              : i
          ),
        }
      }

      return {
        items: [
          ...state.items,
          { product, batch: batch ?? null, quantity: 1, sell_price, subtotal: sell_price },
        ],
      }
    })
  },

  removeItem: (productId, batchId = null) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.product.id === productId &&
                 (batchId ? i.batch?.id === batchId : i.batch === null))
      ),
    }))
  },

  updateQuantity: (productId, batchId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId, batchId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId && (batchId ? i.batch?.id === batchId : i.batch === null)
          ? { ...i, quantity: qty, subtotal: qty * i.sell_price }
          : i
      ),
    }))
  },

  updatePrice: (productId, batchId, price) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId && (batchId ? i.batch?.id === batchId : i.batch === null)
          ? { ...i, sell_price: price, subtotal: i.quantity * price }
          : i
      ),
    }))
  },

  setCustomer: (id) => set({ customerId: id }),
  setDiscount: (amount) => set({ discount: amount }),
  setNotes:    (notes) => set({ notes }),

  clearCart: () => set({ items: [], customerId: null, discount: 0, notes: '' }),

  totalAmount: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
  netAmount:   () => get().totalAmount() - get().discount,
  itemsCount:  () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

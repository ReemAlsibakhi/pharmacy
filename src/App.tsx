import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

// Pages — lazy loaded للأداء
import { lazy, Suspense } from 'react'

const DashboardPage  = lazy(() => import('@/features/dashboard/DashboardPage'))
const POSPage        = lazy(() => import('@/features/pos/POSPage'))
const InventoryPage  = lazy(() => import('@/features/inventory/InventoryPage'))
const PurchasesPage  = lazy(() => import('@/features/purchases/PurchasesPage'))
const CustomersPage  = lazy(() => import('@/features/customers/CustomersPage'))
const SuppliersPage  = lazy(() => import('@/features/suppliers/SuppliersPage'))
const ReportsPage    = lazy(() => import('@/features/reports/ReportsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
          } />
          <Route path="pos" element={
            <Suspense fallback={<PageLoader />}><POSPage /></Suspense>
          } />
          <Route path="inventory" element={
            <Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>
          } />
          <Route path="purchases" element={
            <Suspense fallback={<PageLoader />}><PurchasesPage /></Suspense>
          } />
          <Route path="customers" element={
            <Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>
          } />
          <Route path="suppliers" element={
            <Suspense fallback={<PageLoader />}><SuppliersPage /></Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

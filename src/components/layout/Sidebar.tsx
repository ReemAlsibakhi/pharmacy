import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, ShoppingBag,
  Users, Truck, BarChart3, X, Pill
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'الرئيسية',   icon: LayoutDashboard },
  { to: '/pos',       label: 'نقطة البيع',  icon: ShoppingCart },
  { to: '/inventory', label: 'المخزون',     icon: Package },
  { to: '/purchases', label: 'المشتريات',   icon: ShoppingBag },
  { to: '/customers', label: 'العملاء',     icon: Users },
  { to: '/suppliers', label: 'الموردون',    icon: Truck },
  { to: '/reports',   label: 'التقارير',    icon: BarChart3 },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <aside className={cn(
      'fixed top-0 right-0 z-30 h-full w-64 bg-white border-l border-gray-200',
      'flex flex-col transition-transform duration-300 shadow-sm',
      sidebarOpen ? 'translate-x-0' : 'translate-x-full',
      'md:translate-x-0'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none">حسابات</p>
            <p className="text-xs text-gray-500 mt-0.5">إدارة الصيدلية</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-gray-400 hover:text-gray-600 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">v0.1.0</p>
      </div>
    </aside>
  )
}

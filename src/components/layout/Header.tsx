import { Menu, Bell, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'الرئيسية',
  '/pos':       'نقطة البيع',
  '/inventory': 'إدارة المخزون',
  '/purchases': 'المشتريات',
  '/customers': 'العملاء',
  '/suppliers': 'الموردون',
  '/reports':   'التقارير',
}

export function Header() {
  const { pathname }  = useLocation()
  const { theme, toggleTheme, toggleSidebar } = useUIStore()
  const title = pageTitles[pathname] ?? 'حسابات'

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="toggle theme"
        >
          {theme === 'light'
            ? <Moon className="w-5 h-5" />
            : <Sun  className="w-5 h-5" />}
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
          aria-label="notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

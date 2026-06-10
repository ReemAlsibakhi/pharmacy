import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header }  from './Header'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

export function Layout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        sidebarOpen ? 'md:mr-64' : 'mr-0'
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

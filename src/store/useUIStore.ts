import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  // Sidebar
  sidebarOpen:      boolean
  setSidebarOpen:   (open: boolean) => void
  toggleSidebar:    () => void

  // Theme
  theme:            'light' | 'dark'
  toggleTheme:      () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen:    true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      theme:       'light',
      toggleTheme: () => set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        return { theme: next }
      }),
    }),
    { name: 'hesabat-ui' }
  )
)

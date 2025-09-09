import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface User {
  id: string
  email: string
  name: string
  role?: string
  company?: string
  department?: string
  employeeId?: string
}

interface Settings {
  defaultView: 'dashboard' | '3d' | 'inspections'
  temperatureUnit: 'celsius' | 'fahrenheit'
  pressureUnit: 'bar' | 'psi' | 'kpa'
  flowUnit: 'm3h' | 'gpm' | 'lpm'
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  theme: Theme
  settings: Settings
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingSyncCount: number

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setTheme: (theme: Theme) => void
  updateSettings: (settings: Partial<Settings>) => void
  setOnline: (isOnline: boolean) => void
  setSyncing: (isSyncing: boolean) => void
  setLastSyncTime: (time: Date) => void
  setPendingSyncCount: (count: number) => void
}

const mockLogin = async (email: string, password: string): Promise<User> => {
  // Mock SSO login logic
  if (email === 'user@plantvision.com' && password === 'demo') {
    return {
      id: 'mock-user-1',
      email,
      name: 'Plant Vision User',
      role: 'Field Inspector',
      company: 'Acme Industries',
      department: 'Operations',
      employeeId: 'EMP-001'
    }
  }
  throw new Error('Invalid credentials')
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'system',
      settings: {
        defaultView: 'dashboard',
        temperatureUnit: 'celsius',
        pressureUnit: 'bar',
        flowUnit: 'm3h'
      },
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSyncTime: null,
      pendingSyncCount: 0,

      login: async (email: string, password: string) => {
        try {
          const user = await mockLogin(email, password)
          set({ user, isAuthenticated: true })
        } catch (error) {
          set({ user: null, isAuthenticated: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setTheme: (theme: Theme) => {
        set({ theme })
      },

      updateSettings: (settings: Partial<Settings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings }
        }))
      },

      setOnline: (isOnline: boolean) => {
        set({ isOnline })
      },

      setSyncing: (isSyncing: boolean) => {
        set({ isSyncing })
      },

      setLastSyncTime: (time: Date) => {
        set({ lastSyncTime: time })
      },

      setPendingSyncCount: (count: number) => {
        set({ pendingSyncCount: count })
      }
    }),
    {
      name: 'plant-vision-app-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// Expose store to window for testing
if (typeof window !== 'undefined') {
  (window as any).useAppStore = useAppStore
}
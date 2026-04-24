import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View } from '../types'

interface AppState {
  token: string
  repoUrl: string
  currentView: View
  selectedNumber: number | null
  themeId: string
  demoMode: boolean
  tooltipsEnabled: boolean
  setToken: (t: string) => void
  setRepoUrl: (r: string) => void
  setView: (v: View, n?: number) => void
  setTheme: (id: string) => void
  setDemoMode: (v: boolean) => void
  setTooltipsEnabled: (v: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: '',
      repoUrl: '',
      currentView: 'issues',
      selectedNumber: null,
      themeId: 'red',
      demoMode: false,
      tooltipsEnabled: true,
      setToken: (token) => set({ token }),
      setRepoUrl: (repoUrl) => set({ repoUrl }),
      setView: (currentView, selectedNumber = null) => set({ currentView, selectedNumber }),
      setTheme: (themeId) => set({ themeId }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setTooltipsEnabled: (tooltipsEnabled) => set({ tooltipsEnabled })
    }),
    { name: 'bulgarian-store' }
  )
)

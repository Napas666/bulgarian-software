import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View, Toast, HistoryItem } from '../types'

interface AppState {
  token: string
  repoUrl: string
  currentView: View
  selectedNumber: number | null
  themeId: string
  demoMode: boolean
  tooltipsEnabled: boolean
  compactMode: boolean
  shortcutsEnabled: boolean
  autoRefreshInterval: number  // seconds, 0 = off
  toasts: Toast[]
  recentlyViewed: HistoryItem[]

  setToken: (t: string) => void
  setRepoUrl: (r: string) => void
  setView: (v: View, n?: number) => void
  setTheme: (id: string) => void
  setDemoMode: (v: boolean) => void
  setTooltipsEnabled: (v: boolean) => void
  setCompactMode: (v: boolean) => void
  setShortcutsEnabled: (v: boolean) => void
  setAutoRefreshInterval: (v: number) => void

  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void

  pushHistory: (item: HistoryItem) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: '',
      repoUrl: '',
      currentView: 'dashboard',
      selectedNumber: null,
      themeId: 'red',
      demoMode: false,
      tooltipsEnabled: true,
      compactMode: false,
      shortcutsEnabled: false,
      autoRefreshInterval: 0,
      toasts: [],
      recentlyViewed: [],

      setToken: (token) => set({ token }),
      setRepoUrl: (repoUrl) => set({ repoUrl }),
      setView: (currentView, selectedNumber = null) => set({ currentView, selectedNumber }),
      setTheme: (themeId) => set({ themeId }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setTooltipsEnabled: (tooltipsEnabled) => set({ tooltipsEnabled }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setShortcutsEnabled: (shortcutsEnabled) => set({ shortcutsEnabled }),
      setAutoRefreshInterval: (autoRefreshInterval) => set({ autoRefreshInterval }),

      addToast: (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random()}`
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

      pushHistory: (item) => set(s => {
        const filtered = s.recentlyViewed.filter(h => !(h.type === item.type && h.number === item.number))
        return { recentlyViewed: [item, ...filtered].slice(0, 7) }
      }),
    }),
    {
      name: 'bulgarian-store',
      partialize: (s) => ({
        token: s.token,
        repoUrl: s.repoUrl,
        themeId: s.themeId,
        demoMode: s.demoMode,
        tooltipsEnabled: s.tooltipsEnabled,
        compactMode: s.compactMode,
        shortcutsEnabled: s.shortcutsEnabled,
        autoRefreshInterval: s.autoRefreshInterval,
        recentlyViewed: s.recentlyViewed,
      })
    }
  )
)

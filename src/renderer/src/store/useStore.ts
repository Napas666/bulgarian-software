import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View } from '../types'

interface AppState {
  token: string
  repoUrl: string
  currentView: View
  selectedNumber: number | null
  setToken: (t: string) => void
  setRepoUrl: (r: string) => void
  setView: (v: View, n?: number) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: '',
      repoUrl: '',
      currentView: 'issues',
      selectedNumber: null,
      setToken: (token) => set({ token }),
      setRepoUrl: (repoUrl) => set({ repoUrl }),
      setView: (currentView, selectedNumber = null) => set({ currentView, selectedNumber })
    }),
    { name: 'bulgarian-store' }
  )
)

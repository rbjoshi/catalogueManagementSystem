/*
 * Copyright (c) 2026. All rights reserved.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  setAuth: (token: string, refreshToken: string, user: UserInfo) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user, isAuthenticated: true }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'catalogue-auth' },
  ),
)

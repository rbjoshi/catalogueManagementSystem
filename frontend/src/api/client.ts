/*
 * Copyright (c) 2026. All rights reserved.
 */
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { refreshToken, logout, setAuth } = useAuthStore.getState()

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true
      try {
        const res = await axios.post('/api/auth/refresh', { refreshToken })
        if (res.data.success) {
          const { accessToken, refreshToken: newRefreshToken, user } = res.data.data
          setAuth(accessToken, newRefreshToken, user)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401) {
      logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api

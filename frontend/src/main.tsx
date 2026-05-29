/*
 * Copyright (c) 2026. All rights reserved.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgb(0 0 0 / 0.12)',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)

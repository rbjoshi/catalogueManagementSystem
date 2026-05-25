import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ItemsPage from '@/pages/ItemsPage'
import ItemFormPage from '@/pages/ItemFormPage'
import CataloguesPage from '@/pages/CataloguesPage'
import CatalogueDesignerPage from '@/pages/CatalogueDesignerPage'
import LookupsPage from '@/pages/LookupsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={<PrivateRoute><AppLayout /></PrivateRoute>}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="items"       element={<ItemsPage />} />
          <Route path="items/new"   element={<ItemFormPage />} />
          <Route path="items/:id"   element={<ItemFormPage />} />
          <Route path="catalogues"  element={<CataloguesPage />} />
          <Route path="catalogues/new"  element={<CatalogueDesignerPage />} />
          <Route path="catalogues/:id"  element={<CatalogueDesignerPage />} />
          <Route path="settings/lookups" element={<LookupsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

import api from './client'
import type {
  ApiResponse, AuthResponse, PageResponse,
  Item, ItemRequest,
  Catalogue, CatalogueTemplate, PdfJob,
  Lookups,
} from '@/types'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, string>) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then(r => r.data),
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }).then(r => r.data),
}

// ── Items ─────────────────────────────────────────────────────────────────────
export const itemsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Item>>>('/items', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiResponse<Item>>(`/items/${id}`).then(r => r.data),
  create: (data: ItemRequest) =>
    api.post<ApiResponse<Item>>('/items', data).then(r => r.data),
  update: (id: string, data: Partial<ItemRequest>) =>
    api.put<ApiResponse<Item>>(`/items/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/items/${id}`).then(r => r.data),
  bulkCreate: (data: ItemRequest[]) =>
    api.post<ApiResponse<Item[]>>('/items/bulk', data).then(r => r.data),
}

// ── Catalogues ────────────────────────────────────────────────────────────────
export const cataloguesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Catalogue>>>('/catalogues', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiResponse<Catalogue>>(`/catalogues/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Catalogue>>('/catalogues', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Catalogue>>(`/catalogues/${id}`, data).then(r => r.data),
  publish: (id: string) =>
    api.post<ApiResponse<Catalogue>>(`/catalogues/${id}/publish`).then(r => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/catalogues/${id}`).then(r => r.data),
  exportPdf: (id: string) =>
    api.post<ApiResponse<PdfJob>>(`/catalogues/${id}/export-pdf`).then(r => r.data),
  getPdfJob: (jobId: string) =>
    api.get<ApiResponse<PdfJob>>(`/catalogues/pdf-jobs/${jobId}`).then(r => r.data),
  templates: () =>
    api.get<ApiResponse<CatalogueTemplate[]>>('/catalogues/templates').then(r => r.data),
}

// ── Lookups ───────────────────────────────────────────────────────────────────
export const lookupsApi = {
  getAll: () =>
    api.get<ApiResponse<Lookups>>('/lookups').then(r => r.data),

  createType: (name: string) =>
    api.post<ApiResponse<unknown>>('/lookups/types', { name }).then(r => r.data),
  updateType: (id: number, name: string) =>
    api.put<ApiResponse<unknown>>(`/lookups/types/${id}`, { name }).then(r => r.data),
  deleteType: (id: number) =>
    api.delete<ApiResponse<void>>(`/lookups/types/${id}`).then(r => r.data),

  createSubType: (typeId: number, name: string) =>
    api.post<ApiResponse<unknown>>(`/lookups/types/${typeId}/sub-types`, { name }).then(r => r.data),
  updateSubType: (id: number, name: string) =>
    api.put<ApiResponse<unknown>>(`/lookups/sub-types/${id}`, { name }).then(r => r.data),
  deleteSubType: (id: number) =>
    api.delete<ApiResponse<void>>(`/lookups/sub-types/${id}`).then(r => r.data),

  createSize: (name: string, decimalValue?: number, sizeList?: string[]) =>
    api.post<ApiResponse<unknown>>('/lookups/sizes', { name, decimalValue, sizeList }).then(r => r.data),
  updateSize: (id: number, name: string, decimalValue?: number, sizeList?: string[]) =>
    api.put<ApiResponse<unknown>>(`/lookups/sizes/${id}`, { name, decimalValue, sizeList }).then(r => r.data),
  deleteSize: (id: number) =>
    api.delete<ApiResponse<void>>(`/lookups/sizes/${id}`).then(r => r.data),

  createBrand: (name: string) =>
    api.post<ApiResponse<unknown>>('/lookups/brands', { name }).then(r => r.data),
  updateBrand: (id: number, name: string) =>
    api.put<ApiResponse<unknown>>(`/lookups/brands/${id}`, { name }).then(r => r.data),
  deleteBrand: (id: number) =>
    api.delete<ApiResponse<void>>(`/lookups/brands/${id}`).then(r => r.data),
}

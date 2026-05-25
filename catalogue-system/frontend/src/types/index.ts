// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserInfo {
  userId: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  entId: string
  companyName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

// ── Items ─────────────────────────────────────────────────────────────────────
export interface LookupItem { id: number; name: string }
export interface SizeItem   { id: number; label: string; unit?: string }

export interface Item {
  itemId: string
  entId: string
  sku?: string
  name: string
  description?: string
  shortDesc?: string
  price?: number
  mrp?: number
  currency: string
  discountPct?: number
  itemType?: LookupItem
  itemSubType?: LookupItem
  itemSize?: SizeItem
  itemBrand?: LookupItem
  weight?: number
  weightUnit?: string
  dimensions?: string
  color?: string
  material?: string
  countryOrigin?: string
  barcode?: string
  images: Array<{ url: string; isPrimary?: boolean; sortOrder?: number }>
  tags: string[]
  attributes: Record<string, unknown>
  stockQty?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ItemRequest {
  sku?: string
  name: string
  description?: string
  shortDesc?: string
  price?: number
  mrp?: number
  currency?: string
  discountPct?: number
  typeId?: number
  subTypeId?: number
  sizeId?: number
  brandId?: number
  weight?: number
  weightUnit?: string
  dimensions?: string
  color?: string
  material?: string
  countryOrigin?: string
  barcode?: string
  images?: Array<Record<string, unknown>>
  tags?: string[]
  attributes?: Record<string, unknown>
  stockQty?: number
  isActive?: boolean
}

// ── Catalogues ────────────────────────────────────────────────────────────────
export type CatalogueStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Catalogue {
  catId: string
  entId: string
  name: string
  description?: string
  layoutJson: Record<string, unknown>
  pageSize: string
  orientation: string
  status: CatalogueStatus
  coverImage?: string
  itemCount: number
  version: number
  templateId?: number
  templateName?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CatalogueTemplate {
  templateId: number
  name: string
  description: string
  pageSize: string
  layoutConfig: { columns: number; rows: number; showPrice: boolean; showDescription: boolean; showSku: boolean }
}

export interface CatalogueItemSlot {
  itemId: string
  pageNumber: number
  position: number
  customName?: string
  customPrice?: number
  customDesc?: string
  customOverrides?: Record<string, unknown>
}

// ── Lookups ───────────────────────────────────────────────────────────────────
export interface Lookups {
  types:    Array<{ id: number; name: string; description: string }>
  subTypes: Array<{ id: number; name: string; typeId: number }>
  sizes:    Array<{ id: number; label: string; unit: string }>
  brands:   Array<{ id: number; name: string; logoUrl: string }>
}

// ── API wrapper ───────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Record<string, string>
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ── PDF ───────────────────────────────────────────────────────────────────────
export interface PdfJob {
  jobId: string
  catId: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  fileUrl?: string
  errorMsg?: string
  createdAt: string
  completedAt?: string
}

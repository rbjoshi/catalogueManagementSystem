import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, Package, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { itemsApi, lookupsApi } from '@/api/services'
import type { Item } from '@/types'
import clsx from 'clsx'

export default function ItemsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeId, setTypeId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [page, setPage] = useState(0)

  const { data: lookups } = useQuery({
    queryKey: ['lookups'],
    queryFn: () => lookupsApi.getAll(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['items', search, typeId, brandId, page],
    queryFn: () => itemsApi.list({ search: search || undefined, typeId, brandId, page, size: 20 }),
    placeholderData: prev => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item deleted')
    },
    onError: () => toast.error('Delete failed'),
  })

  const items  = data?.data?.content ?? []
  const total  = data?.data?.totalElements ?? 0
  const pages  = data?.data?.totalPages ?? 1

  const handleDelete = (item: Item) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    deleteMutation.mutate(item.itemId)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Items</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total.toLocaleString()} total items</p>
        </div>
        <Link to="/items/new" className="btn-primary">
          <Plus size={16} /> Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
          />
        </div>
        <select
          className="input w-40"
          value={typeId ?? ''}
          onChange={e => { setTypeId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
        >
          <option value="">All types</option>
          {lookups?.data?.types?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          className="input w-40"
          value={brandId ?? ''}
          onChange={e => { setBrandId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
        >
          <option value="">All brands</option>
          {lookups?.data?.brands?.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Package size={40} className="mb-3 opacity-40" />
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new item</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Brand</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(item => (
                <tr key={item.itemId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package size={14} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 leading-tight">{item.name}</p>
                        {item.shortDesc && <p className="text-xs text-slate-400 truncate max-w-xs">{item.shortDesc}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{item.sku ?? '—'}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.itemType?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.itemBrand?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {item.price != null ? `${item.currency} ${item.price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={item.isActive ? 'badge-green' : 'badge-slate'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/items/${item.itemId}`} className="btn-ghost btn-sm p-1.5">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item)}
                        className="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {page + 1} of {pages}</p>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= pages - 1}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

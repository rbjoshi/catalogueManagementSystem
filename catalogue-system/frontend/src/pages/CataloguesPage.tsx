import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, Edit2, Trash2, Globe, Loader2, FileDown, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { cataloguesApi } from '@/api/services'
import type { Catalogue, CatalogueStatus } from '@/types'

const STATUS_TABS: Array<{ label: string; value: CatalogueStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

export default function CataloguesPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState<CatalogueStatus | ''>('')
  const [search, setSearch] = useState('')
  const [pdfJobId, setPdfJobId] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['catalogues', status, search],
    queryFn: () => cataloguesApi.list({ status: status || undefined, search: search || undefined, size: 24 }),
  })

  const publishMutation = useMutation({
    mutationFn: cataloguesApi.publish,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogues'] }); toast.success('Catalogue published!') },
  })

  const deleteMutation = useMutation({
    mutationFn: cataloguesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogues'] }); toast.success('Catalogue archived') },
  })

  const exportMutation = useMutation({
    mutationFn: cataloguesApi.exportPdf,
    onSuccess: (res, catId) => {
      setPdfJobId(prev => ({ ...prev, [catId]: res.data.jobId }))
      toast.success('PDF export started! Check back shortly.')
    },
  })

  const catalogues = data?.data?.content ?? []

  const statusBadge = (s: CatalogueStatus) => {
    if (s === 'PUBLISHED') return <span className="badge-green">Published</span>
    if (s === 'DRAFT')     return <span className="badge-amber">Draft</span>
    return <span className="badge-slate">Archived</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalogues</h1>
          <p className="text-sm text-slate-400 mt-0.5">{data?.data?.totalElements ?? 0} total</p>
        </div>
        <Link to="/catalogues/new" className="btn-primary">
          <Plus size={16} /> New Catalogue
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                status === tab.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Search catalogues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : catalogues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <BookOpen size={44} className="mb-3 opacity-30" />
          <p className="font-medium">No catalogues yet</p>
          <Link to="/catalogues/new" className="btn-primary mt-4">
            <Plus size={15} /> Create your first catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {catalogues.map((cat: Catalogue) => (
            <div key={cat.catId} className="card-hover p-5 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">v{cat.version} · {cat.itemCount} items</p>
                </div>
                {statusBadge(cat.status)}
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
              )}

              {/* Meta */}
              <div className="text-xs text-slate-400 flex gap-3">
                <span>{cat.pageSize} {cat.orientation === 'LANDSCAPE' ? '⟺' : '⟕'}</span>
                {cat.templateName && <span>· {cat.templateName}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                <Link to={`/catalogues/${cat.catId}`} className="btn-secondary btn-sm flex-1 justify-center">
                  <Edit2 size={13} /> Edit
                </Link>
                {cat.status === 'DRAFT' && (
                  <button
                    onClick={() => publishMutation.mutate(cat.catId)}
                    disabled={publishMutation.isPending}
                    className="btn-primary btn-sm flex-1 justify-center"
                  >
                    <Globe size={13} /> Publish
                  </button>
                )}
                <button
                  onClick={() => exportMutation.mutate(cat.catId)}
                  disabled={exportMutation.isPending}
                  className="btn-ghost btn-sm p-1.5"
                  title="Export PDF"
                >
                  <FileDown size={14} className="text-slate-500" />
                </button>
                <button
                  onClick={() => { if (confirm('Archive this catalogue?')) deleteMutation.mutate(cat.catId) }}
                  className="btn-ghost btn-sm p-1.5 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {pdfJobId[cat.catId] && (
                <p className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded">
                  Job ID: <code className="font-mono">{pdfJobId[cat.catId].slice(0, 8)}…</code>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

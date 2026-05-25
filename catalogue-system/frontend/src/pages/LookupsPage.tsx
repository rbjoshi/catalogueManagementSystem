import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { lookupsApi } from '@/api/services'

type Tab = 'types' | 'sizes' | 'brands'

export default function LookupsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('types')
  const [newName, setNewName] = useState('')
  const [newTypeId, setNewTypeId] = useState<number | undefined>()
  const [subTypeName, setSubTypeName] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['lookups'],
    queryFn: () => lookupsApi.getAll(),
  })

  const createTypeMut  = useMutation({ mutationFn: lookupsApi.createType,  onSuccess: () => { qc.invalidateQueries({ queryKey: ['lookups'] }); setNewName(''); toast.success('Type created') } })
  const createSizeMut  = useMutation({ mutationFn: lookupsApi.createSize,  onSuccess: () => { qc.invalidateQueries({ queryKey: ['lookups'] }); setNewName(''); toast.success('Size created') } })
  const createBrandMut = useMutation({ mutationFn: lookupsApi.createBrand, onSuccess: () => { qc.invalidateQueries({ queryKey: ['lookups'] }); setNewName(''); toast.success('Brand created') } })
  const createSubTypeMut = useMutation({
    mutationFn: ({ typeId, name }: { typeId: number; name: string }) => lookupsApi.createSubType(typeId, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lookups'] }); setSubTypeName(''); toast.success('Sub type created') },
  })

  const lookups = data?.data

  const handleCreate = () => {
    if (!newName.trim()) return
    if (tab === 'types')  createTypeMut.mutate(newName)
    if (tab === 'sizes')  createSizeMut.mutate(newName)
    if (tab === 'brands') createBrandMut.mutate(newName)
  }

  const handleCreateSubType = () => {
    if (!newTypeId || !subTypeName.trim()) return
    createSubTypeMut.mutate({ typeId: newTypeId, name: subTypeName })
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'types',  label: 'Item Types' },
    { key: 'sizes',  label: 'Sizes' },
    { key: 'brands', label: 'Brands' },
  ]

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lookups</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage classification data for your enterprise</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={22} className="animate-spin text-brand-500" /></div>
      ) : (
        <div className="space-y-5">
          {/* Add new */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Add {tab === 'types' ? 'Type' : tab === 'sizes' ? 'Size' : 'Brand'}
            </h3>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder={`Enter ${tab.slice(0, -1)} name…`}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} className="btn-primary">
                <Plus size={15} /> Add
              </button>
            </div>
          </div>

          {/* Sub types (only shown when on types tab) */}
          {tab === 'types' && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Sub Type</h3>
              <div className="flex gap-2">
                <select
                  className="input w-44"
                  value={newTypeId ?? ''}
                  onChange={e => setNewTypeId(Number(e.target.value))}
                >
                  <option value="">— Parent type —</option>
                  {lookups?.types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input
                  className="input flex-1"
                  placeholder="Sub type name…"
                  value={subTypeName}
                  onChange={e => setSubTypeName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateSubType()}
                />
                <button onClick={handleCreateSubType} className="btn-primary" disabled={!newTypeId}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="card overflow-hidden">
            {tab === 'types' && (
              <div>
                {lookups?.types?.length === 0 ? (
                  <EmptyState label="types" />
                ) : (
                  lookups?.types?.map(t => (
                    <div key={t.id}>
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-brand-500" />
                          <span className="font-medium text-sm text-slate-700">{t.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {lookups?.subTypes?.filter(s => s.typeId === t.id).length} sub types
                        </span>
                      </div>
                      {lookups?.subTypes?.filter(s => s.typeId === t.id).map(s => (
                        <div key={s.id} className="flex items-center px-4 py-2.5 border-b border-slate-50 pl-10">
                          <span className="text-sm text-slate-600">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'sizes' && (
              <div>
                {lookups?.sizes?.length === 0 ? <EmptyState label="sizes" /> : (
                  lookups?.sizes?.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-700">{s.label}</span>
                      {s.unit && <span className="badge-slate">{s.unit}</span>}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'brands' && (
              <div>
                {lookups?.brands?.length === 0 ? <EmptyState label="brands" /> : (
                  lookups?.brands?.map(b => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.name} className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                          <span className="text-xs text-slate-400">{b.name[0]}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700">{b.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
      <Tag size={28} className="mb-2 opacity-50" />
      <p className="text-sm">No {label} yet</p>
    </div>
  )
}

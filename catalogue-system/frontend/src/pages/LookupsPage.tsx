import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Loader2, X, Edit2, Trash2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { lookupsApi } from '@/api/services'
import { getImageUrl } from '@/utils/imageUrl'

type Tab = 'types' | 'sizes' | 'brands'

export default function LookupsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('types')
  
  // Creation States
  const [newName, setNewName] = useState('')
  const [newDecimalValue, setNewDecimalValue] = useState('')
  const [newSizeList, setNewSizeList] = useState('')
  
  const [newTypeId, setNewTypeId] = useState<number | undefined>()
  const [subTypeName, setSubTypeName] = useState('')

  // Edit States
  const [editingId, setEditingId] = useState<{ type: string, id: number } | null>(null)
  const [editName, setEditName] = useState('')
  const [editDecimalValue, setEditDecimalValue] = useState('')
  const [editSizeList, setEditSizeList] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['lookups'],
    queryFn: () => lookupsApi.getAll(),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lookups'] })

  const onError = (error: any) => {
    console.error(error);
    toast.error(error?.response?.data?.message || error?.message || 'An error occurred');
  }

  // Mutations
  const createTypeMut  = useMutation({ mutationFn: (name: string) => lookupsApi.createType(name),  onSuccess: () => { invalidate(); setNewName(''); toast.success('Type created') }, onError })
  const updateTypeMut  = useMutation({ mutationFn: (p: {id: number, name: string}) => lookupsApi.updateType(p.id, p.name), onSuccess: () => { invalidate(); setEditingId(null); toast.success('Type updated') }, onError })
  const deleteTypeMut  = useMutation({ mutationFn: (id: number) => lookupsApi.deleteType(id),  onSuccess: () => { invalidate(); toast.success('Type deleted') }, onError })

  const createSubTypeMut = useMutation({ mutationFn: (p: { typeId: number; name: string }) => lookupsApi.createSubType(p.typeId, p.name), onSuccess: () => { invalidate(); setSubTypeName(''); toast.success('Sub type created') }, onError })
  const updateSubTypeMut = useMutation({ mutationFn: (p: {id: number, name: string}) => lookupsApi.updateSubType(p.id, p.name), onSuccess: () => { invalidate(); setEditingId(null); toast.success('Sub type updated') }, onError })
  const deleteSubTypeMut = useMutation({ mutationFn: (id: number) => lookupsApi.deleteSubType(id), onSuccess: () => { invalidate(); toast.success('Sub type deleted') }, onError })

  const createSizeMut  = useMutation({ mutationFn: (p: {name: string, decimalValue?: number, sizeList?: string[]}) => lookupsApi.createSize(p.name, p.decimalValue, p.sizeList),  onSuccess: () => { invalidate(); setNewName(''); setNewDecimalValue(''); setNewSizeList(''); toast.success('Size created') }, onError })
  const updateSizeMut  = useMutation({ mutationFn: (p: {id: number, name: string, decimalValue?: number, sizeList?: string[]}) => lookupsApi.updateSize(p.id, p.name, p.decimalValue, p.sizeList), onSuccess: () => { invalidate(); setEditingId(null); toast.success('Size updated') }, onError })
  const deleteSizeMut  = useMutation({ mutationFn: (id: number) => lookupsApi.deleteSize(id),  onSuccess: () => { invalidate(); toast.success('Size deleted') }, onError })

  const createBrandMut = useMutation({ mutationFn: (name: string) => lookupsApi.createBrand(name), onSuccess: () => { invalidate(); setNewName(''); toast.success('Brand created') }, onError })
  const updateBrandMut = useMutation({ mutationFn: (p: {id: number, name: string}) => lookupsApi.updateBrand(p.id, p.name), onSuccess: () => { invalidate(); setEditingId(null); toast.success('Brand updated') }, onError })
  const deleteBrandMut = useMutation({ mutationFn: (id: number) => lookupsApi.deleteBrand(id), onSuccess: () => { invalidate(); toast.success('Brand deleted') }, onError })

  const lookups = data?.data

  const handleCreate = () => {
    if (!newName.trim()) return
    if (tab === 'types')  createTypeMut.mutate(newName)
    if (tab === 'sizes')  {
        const dec = newDecimalValue.trim() ? parseFloat(newDecimalValue) : undefined
        const slist = newSizeList.trim() ? newSizeList.split(',').map(s => s.trim()).filter(Boolean) : undefined
        createSizeMut.mutate({name: newName, decimalValue: dec, sizeList: slist})
    }
    if (tab === 'brands') createBrandMut.mutate(newName)
  }

  const handleCreateSubType = () => {
    if (!newTypeId || !subTypeName.trim()) return
    createSubTypeMut.mutate({ typeId: newTypeId, name: subTypeName })
  }

  const startEdit = (type: string, id: number, name: string, decimalValue?: number, sizeList?: string[]) => {
      setEditingId({ type, id })
      setEditName(name)
      setEditDecimalValue(decimalValue?.toString() || '')
      setEditSizeList(sizeList?.join(', ') || '')
  }

  const handleSaveEdit = () => {
      if (!editingId || !editName.trim()) return
      const { type, id } = editingId
      if (type === 'type') updateTypeMut.mutate({ id, name: editName })
      else if (type === 'subtype') updateSubTypeMut.mutate({ id, name: editName })
      else if (type === 'brand') updateBrandMut.mutate({ id, name: editName })
      else if (type === 'size') {
          const dec = editDecimalValue.trim() ? parseFloat(editDecimalValue) : undefined
          const slist = editSizeList.trim() ? editSizeList.split(',').map(s => s.trim()).filter(Boolean) : undefined
          updateSizeMut.mutate({ id, name: editName, decimalValue: dec, sizeList: slist })
      }
  }

  const handleDelete = (type: string, id: number) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return
      if (type === 'type') deleteTypeMut.mutate(id)
      else if (type === 'subtype') deleteSubTypeMut.mutate(id)
      else if (type === 'brand') deleteBrandMut.mutate(id)
      else if (type === 'size') deleteSizeMut.mutate(id)
  }

  const isEditing = (type: string, id: number) => editingId?.type === type && editingId?.id === id

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'types',  label: 'Item Types' },
    { key: 'sizes',  label: 'Sizes' },
    { key: 'brands', label: 'Brands' },
  ]

  const ActionButtons = ({ type, id, onEdit }: { type: string, id: number, onEdit: () => void }) => {
      if (isEditing(type, id)) {
          return (
              <div className="flex items-center gap-2">
                  <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
              </div>
          )
      }
      return (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 rounded"><Edit2 size={13} /></button>
              <button onClick={() => handleDelete(type, id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded"><Trash2 size={13} /></button>
          </div>
      )
  }

  return (
    <div className="max-w-2xl pb-20">
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
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  className="input w-full"
                  placeholder={`Enter ${tab.slice(0, -1)} name…`}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                {tab === 'sizes' && (
                  <div className="flex gap-2">
                    <input
                      className="input w-1/3"
                      placeholder="Decimal Value (e.g. 10.5)"
                      type="number"
                      step="0.01"
                      value={newDecimalValue}
                      onChange={e => setNewDecimalValue(e.target.value)}
                    />
                    <input
                      className="input flex-1"
                      placeholder="Size List (comma separated, e.g. S, M, L)"
                      value={newSizeList}
                      onChange={e => setNewSizeList(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <button onClick={handleCreate} className="btn-primary mt-0.5">
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
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 group">
                        <div className="flex items-center gap-2 flex-1">
                          <Tag size={13} className="text-brand-500" />
                          {isEditing('type', t.id) ? (
                              <input autoFocus className="input py-1 px-2 text-sm w-48" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}/>
                          ) : (
                              <span className="font-medium text-sm text-slate-700">{t.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {lookups?.subTypes?.filter(s => s.typeId === t.id).length} sub types
                          </span>
                          <ActionButtons type="type" id={t.id} onEdit={() => startEdit('type', t.id, t.name)} />
                        </div>
                      </div>
                      {lookups?.subTypes?.filter(s => s.typeId === t.id).map(s => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 pl-10 group">
                          <div className="flex-1">
                              {isEditing('subtype', s.id) ? (
                                  <input autoFocus className="input py-1 px-2 text-sm w-48" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}/>
                              ) : (
                                  <span className="text-sm text-slate-600">{s.name}</span>
                              )}
                          </div>
                          <ActionButtons type="subtype" id={s.id} onEdit={() => startEdit('subtype', s.id, s.name)} />
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
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 group">
                      <div className="flex-1 flex flex-col gap-1">
                          {isEditing('size', s.id) ? (
                              <div className="space-y-2 max-w-sm">
                                  <input autoFocus className="input py-1 px-2 text-sm w-full" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Label" />
                                  <div className="flex gap-2">
                                      <input className="input py-1 px-2 text-sm w-1/3" value={editDecimalValue} onChange={e => setEditDecimalValue(e.target.value)} placeholder="Decimal Value" />
                                      <input className="input py-1 px-2 text-sm flex-1" value={editSizeList} onChange={e => setEditSizeList(e.target.value)} placeholder="List (comma separated)" onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} />
                                  </div>
                              </div>
                          ) : (
                              <>
                                <span className="text-sm font-medium text-slate-700">{s.label}</span>
                                {(s.decimalValue !== undefined || (s.sizeList && s.sizeList.length > 0)) && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {s.decimalValue !== undefined && <span className="badge-slate bg-slate-100">Val: {s.decimalValue}</span>}
                                        {s.sizeList && s.sizeList.length > 0 && <span className="badge-slate bg-slate-100">List: {s.sizeList.join(', ')}</span>}
                                    </div>
                                )}
                              </>
                          )}
                      </div>
                      <div className="flex items-center gap-3">
                          {s.unit && !isEditing('size', s.id) && <span className="badge-slate">{s.unit}</span>}
                          <ActionButtons type="size" id={s.id} onEdit={() => startEdit('size', s.id, s.label, s.decimalValue, s.sizeList)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'brands' && (
              <div>
                {lookups?.brands?.length === 0 ? <EmptyState label="brands" /> : (
                  lookups?.brands?.map(b => (
                    <div key={b.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 group">
                      <div className="flex items-center gap-3 flex-1">
                        {b.logoUrl ? (
                          <img src={getImageUrl(b.logoUrl)} alt={b.name} className="w-6 h-6 object-contain rounded" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                            <span className="text-xs text-slate-400">{b.name[0]}</span>
                          </div>
                        )}
                        {isEditing('brand', b.id) ? (
                            <input autoFocus className="input py-1 px-2 text-sm w-48" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}/>
                        ) : (
                            <span className="text-sm font-medium text-slate-700">{b.name}</span>
                        )}
                      </div>
                      <ActionButtons type="brand" id={b.id} onEdit={() => startEdit('brand', b.id, b.name)} />
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

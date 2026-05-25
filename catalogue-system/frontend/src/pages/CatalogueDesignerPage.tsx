import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, closestCenter, DragEndEvent,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { KeyboardSensor } from '@dnd-kit/core'
import {
  ArrowLeft, Save, Loader2, Plus, X, GripVertical,
  Package, Globe, FileDown, Settings2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cataloguesApi, itemsApi, lookupsApi } from '@/api/services'
import type { Item, CatalogueTemplate } from '@/types'

interface DesignerItem {
  id: string       // item.itemId
  item: Item
  position: number
  pageNumber: number
  customName?: string
  customPrice?: number
}

function SortableCard({ di, onRemove }: { di: DesignerItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: di.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="card p-3 flex flex-col gap-2 relative group">
      <div className="flex items-start gap-2">
        <button {...listeners} {...attributes} className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          {di.item.images?.[0]?.url ? (
            <img src={di.item.images[0].url} alt="" className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-100" />
          ) : (
            <div className="w-full h-20 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
              <Package size={20} className="text-slate-300" />
            </div>
          )}
          <p className="text-xs font-medium text-slate-700 leading-tight truncate">
            {di.customName ?? di.item.name}
          </p>
          {di.item.price != null && (
            <p className="text-xs text-brand-600 font-semibold mt-0.5">
              {di.item.currency} {(di.customPrice ?? di.item.price).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 w-5 h-5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  )
}

export default function CatalogueDesignerPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('PORTRAIT')
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>()
  const [designerItems, setDesignerItems] = useState<DesignerItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [showItemPicker, setShowItemPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Queries
  const { data: catData } = useQuery({
    queryKey: ['catalogue', id],
    queryFn: () => cataloguesApi.get(id!),
    enabled: isEdit,
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => cataloguesApi.templates(),
  })

  const { data: itemsData } = useQuery({
    queryKey: ['items-picker', itemSearch],
    queryFn: () => itemsApi.list({ search: itemSearch || undefined, size: 40 }),
  })

  // Populate form when editing
  useEffect(() => {
    if (catData?.data) {
      const c = catData.data
      setName(c.name)
      setDescription(c.description ?? '')
      setPageSize(c.pageSize)
      setOrientation(c.orientation)
      setSelectedTemplateId(c.templateId)
    }
  }, [catData])

  // DnD
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      setDesignerItems(items => {
        const oldIdx = items.findIndex(i => i.id === active.id)
        const newIdx = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIdx, newIdx).map((item, idx) => ({ ...item, position: idx }))
      })
    }
  }

  const addItem = (item: Item) => {
    if (designerItems.find(d => d.id === item.itemId)) {
      toast.error('Item already in catalogue')
      return
    }
    setDesignerItems(prev => [...prev, {
      id: item.itemId,
      item,
      position: prev.length,
      pageNumber: 1,
    }])
  }

  const removeItem = (itemId: string) => {
    setDesignerItems(prev => prev.filter(d => d.id !== itemId))
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEdit ? cataloguesApi.update(id!, data) : cataloguesApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['catalogues'] })
      toast.success(isEdit ? 'Catalogue saved!' : 'Catalogue created!')
      if (!isEdit) navigate(`/catalogues/${res.data.catId}`)
    },
    onError: () => toast.error('Save failed'),
  })

  const exportMutation = useMutation({
    mutationFn: () => cataloguesApi.exportPdf(id!),
    onSuccess: (res) => {
      toast.success(`PDF export started — Job ID: ${res.data.jobId.slice(0, 8)}…`)
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => cataloguesApi.publish(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogues'] }); toast.success('Published!') },
  })

  const handleSave = () => {
    if (!name.trim()) { toast.error('Catalogue name is required'); return }
    saveMutation.mutate({
      name,
      description,
      pageSize,
      orientation,
      templateId: selectedTemplateId,
      layoutJson: { columns: getColumns(), rows: 4, templateId: selectedTemplateId },
      items: designerItems.map(d => ({
        itemId: d.id,
        pageNumber: d.pageNumber,
        position: d.position,
        customName: d.customName,
        customPrice: d.customPrice,
      })),
    })
  }

  const getColumns = () => {
    const tpl = templates?.data?.find(t => t.templateId === selectedTemplateId)
    return tpl?.layoutConfig?.columns ?? 2
  }

  const gridCols = getColumns() === 3 ? 'grid-cols-3' : getColumns() >= 4 ? 'grid-cols-4' : 'grid-cols-2'

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/catalogues" className="btn-ghost btn-sm p-1.5"><ArrowLeft size={16} /></Link>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="text-xl font-semibold text-slate-900 bg-transparent border-0 outline-none flex-1 placeholder:text-slate-300"
          placeholder="Catalogue name…"
        />
        <div className="flex items-center gap-2">
          {isEdit && (
            <>
              <button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} className="btn-secondary btn-sm">
                {exportMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                Export PDF
              </button>
              <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="btn-secondary btn-sm">
                <Globe size={14} /> Publish
              </button>
            </>
          )}
          <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: settings panel */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Settings */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 size={14} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-700">Settings</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label text-xs">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={2} className="input text-sm resize-none" placeholder="Optional description" />
              </div>
              <div>
                <label className="label text-xs">Page Size</label>
                <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="input text-sm">
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="LETTER">Letter</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Orientation</label>
                <select value={orientation} onChange={e => setOrientation(e.target.value)} className="input text-sm">
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Template</h3>
            <div className="space-y-2">
              {templates?.data?.map((t: CatalogueTemplate) => (
                <button
                  key={t.templateId}
                  onClick={() => setSelectedTemplateId(t.templateId)}
                  className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${
                    selectedTemplateId === t.templateId
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{t.layoutConfig.columns}×{t.layoutConfig.rows} · {t.pageSize}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Item count */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Items in Catalogue</h3>
              <span className="badge-blue">{designerItems.length}</span>
            </div>
          </div>
        </div>

        {/* Center: canvas */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Canvas toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{designerItems.length} items · Drag to reorder</p>
            <button onClick={() => setShowItemPicker(true)} className="btn-primary btn-sm">
              <Plus size={14} /> Add Items
            </button>
          </div>

          {/* Drop canvas */}
          <div className="card flex-1 p-5 overflow-auto">
            {designerItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                <Package size={48} className="opacity-40" />
                <p className="font-medium">Canvas is empty</p>
                <button onClick={() => setShowItemPicker(true)} className="btn-secondary btn-sm">
                  <Plus size={14} /> Add items to get started
                </button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={designerItems.map(d => d.id)} strategy={rectSortingStrategy}>
                  <div className={`grid ${gridCols} gap-3`}>
                    {designerItems.map(di => (
                      <SortableCard key={di.id} di={di} onRemove={() => removeItem(di.id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Item picker modal */}
      {showItemPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Add Items to Catalogue</h3>
              <button onClick={() => setShowItemPicker(false)} className="btn-ghost btn-sm p-1.5">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <input
                className="input"
                placeholder="Search items…"
                value={itemSearch}
                onChange={e => setItemSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-auto flex-1 p-4">
              <div className="grid grid-cols-2 gap-3">
                {itemsData?.data?.content?.map((item: Item) => {
                  const added = designerItems.some(d => d.id === item.itemId)
                  return (
                    <button
                      key={item.itemId}
                      onClick={() => addItem(item)}
                      disabled={added}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        added
                          ? 'border-brand-200 bg-brand-50 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.images?.[0]?.url ? (
                          <img src={item.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.sku ? `SKU: ${item.sku}` : ''}</p>
                          {item.price && (
                            <p className="text-xs font-semibold text-brand-600">{item.currency} {item.price.toLocaleString()}</p>
                          )}
                        </div>
                        {added && <span className="text-xs text-brand-500 font-medium">Added</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => setShowItemPicker(false)} className="btn-primary w-full justify-center">
                Done ({designerItems.length} items selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

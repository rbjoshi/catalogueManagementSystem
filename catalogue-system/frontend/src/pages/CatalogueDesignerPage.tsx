import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
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
  Package, Globe, FileDown, Settings2, LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cataloguesApi, itemsApi, lookupsApi, uploadApi } from '@/api/services'
import type { Item, CatalogueTemplate } from '@/types'
import { useAuthStore } from '@/store/authStore'
import CatalogueTabularView from '@/components/catalogue/CatalogueTabularView'
import CatalogueHeader from '@/components/catalogue/CatalogueHeader'
import { getImageUrl } from '@/utils/imageUrl'

interface DesignerItem {
  id: string       // item.itemId
  item: Item
  position: number
  pageNumber: number
  customName?: string
  customPrice?: number
  customOverrides?: Record<string, any>
}

interface DisplayFields {
  name: boolean
  price: boolean
  sku: boolean
  size: boolean
  brand: boolean
  description: boolean
}

function SortableCard({ di, onRemove, onUpdate, displayFields }: { di: DesignerItem; onRemove: () => void; onUpdate: (updates: Partial<DesignerItem>) => void; displayFields: DisplayFields }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: di.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const currentImgUrl = di.customOverrides?.imageUrl || di.item.images?.[0]?.url
  const hasMultipleImages = (di.item.images?.length || 0) > 1

  const cycleImage = (direction: 1 | -1) => {
    if (!di.item.images) return
    const currentIdx = di.item.images.findIndex(img => img.url === currentImgUrl)
    const idx = currentIdx >= 0 ? currentIdx : 0
    let nextIdx = (idx + direction) % di.item.images.length
    if (nextIdx < 0) nextIdx = di.item.images.length - 1
    onUpdate({ customOverrides: { ...(di.customOverrides || {}), imageUrl: di.item.images[nextIdx].url } })
  }

  return (
    <div ref={setNodeRef} style={style} className="card p-3 flex flex-col gap-2 relative group">
      <div className="flex items-start gap-2">
        <button {...listeners} {...attributes} className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          {currentImgUrl ? (
            <div className="relative w-full h-24 mb-2 group/img">
              <img src={getImageUrl(currentImgUrl)} alt="" className="w-full h-full object-cover rounded-lg border border-slate-100" />
              {hasMultipleImages && (
                <>
                  <button onClick={() => cycleImage(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/img:opacity-100 bg-white/90 p-0.5 rounded-full text-slate-700 hover:bg-white shadow-sm transition-opacity"><ChevronLeft size={14}/></button>
                  <button onClick={() => cycleImage(1)} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/img:opacity-100 bg-white/90 p-0.5 rounded-full text-slate-700 hover:bg-white shadow-sm transition-opacity"><ChevronRight size={14}/></button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-20 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
              <Package size={20} className="text-slate-300" />
            </div>
          )}
          {displayFields.name && (
            <p className="text-xs font-medium text-slate-700 leading-tight truncate">
              {di.customName ?? di.item.name}
            </p>
          )}
          {displayFields.sku && di.item.sku && (
            <p className="text-xs text-slate-400 mt-0.5">SKU: {di.item.sku}</p>
          )}
          {displayFields.size && di.item.itemSize && (
            <p className="text-xs text-slate-400 mt-0.5">Size: {di.item.itemSize.label} {di.item.itemSize.unit || ''}</p>
          )}
          {displayFields.brand && di.item.itemBrand && (
            <p className="text-xs text-slate-400 mt-0.5">Brand: {di.item.itemBrand.name}</p>
          )}
          {displayFields.description && (di.item.shortDesc || di.item.description) && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{di.item.shortDesc || di.item.description}</p>
          )}
          {displayFields.price && di.item.price != null && (
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
  const { user } = useAuthStore()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('PORTRAIT')
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>()
  const [designerItems, setDesignerItems] = useState<DesignerItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [catalogueStyle, setCatalogueStyle] = useState<'GRID' | 'TABULAR'>('GRID')
  const [displayFields, setDisplayFields] = useState<DisplayFields>({
    name: true,
    price: true,
    sku: true,
    size: true,
    brand: true,
    description: false,
  })
  const [tabularSettings, setTabularSettings] = useState({
    logoUrl: user?.logoUrl || '',
    companyName: user?.companyName || '',
    phone: '',
    mobile: '',
    email: '',
    website: '',
    address: '',
    headerFontSize: 24,
    headerColor: '#000000',
    logoSize: 64,
    tableBorderColor: 'red',
    headerSku: 'SKU',
    headerName: 'MODEL NO.',
    headerDesc: 'DESCRIPTION',
    headerSize: 'SIZE',
    headerBrand: 'BRAND',
    headerPrice: 'PRICE'
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)

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
    if (catData?.data && !hasLoaded) {
      const c = catData.data
      setName(c.name)
      setDescription(c.description ?? '')
      setPageSize(c.pageSize)
      setOrientation(c.orientation)
      setSelectedTemplateId(c.templateId)
      if (c.layoutJson) {
        if (c.layoutJson.style) setCatalogueStyle(c.layoutJson.style as 'GRID' | 'TABULAR')
        if (c.layoutJson.tabularSettings) setTabularSettings({ ...tabularSettings, ...(c.layoutJson.tabularSettings as any) })
        if (c.layoutJson.displayFields) setDisplayFields(c.layoutJson.displayFields as DisplayFields)
      }
      if (c.items) {
        setDesignerItems(c.items.map(ci => ({
          id: ci.item.itemId,
          item: ci.item,
          position: ci.position,
          pageNumber: ci.pageNumber,
          customName: ci.customName,
          customPrice: ci.customPrice,
          customOverrides: ci.customOverrides,
        })))
      }
      setHasLoaded(true)
    }
  }, [catData, hasLoaded, tabularSettings])

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

  const updateItem = (itemId: string, updates: Partial<DesignerItem>) => {
    setDesignerItems(prev => prev.map(d => d.id === itemId ? { ...d, ...updates } : d))
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

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: name || 'Catalogue',
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
      layoutJson: { 
        columns: getColumns(), 
        rows: 4, 
        templateId: selectedTemplateId,
        style: catalogueStyle,
        displayFields,
        tabularSettings: catalogueStyle === 'TABULAR' ? tabularSettings : undefined
      },
      items: designerItems.map(d => ({
        itemId: d.id,
        pageNumber: d.pageNumber,
        position: d.position,
        customName: d.customName,
        customPrice: d.customPrice,
        customOverrides: d.customOverrides,
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
              <button onClick={handlePrint} className="btn-secondary btn-sm">
                <FileDown size={14} />
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
                <label className="label text-xs">Catalogue Name <span className="text-red-500">*</span></label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="input text-sm" 
                  placeholder="e.g. Summer Collection"
                />
              </div>
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

          {/* Style Toggle */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Style</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setCatalogueStyle('GRID')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${catalogueStyle === 'GRID' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button 
                onClick={() => setCatalogueStyle('TABULAR')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${catalogueStyle === 'TABULAR' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={14} /> Tabular
              </button>
            </div>
          </div>

          {/* Header & Table Settings */}
          <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Header Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="label text-xs">Company Name</label>
                  <input 
                    value={tabularSettings.companyName} 
                    onChange={e => setTabularSettings({...tabularSettings, companyName: e.target.value})} 
                    className="input text-sm" 
                  />
                </div>
                <div>
                  <label className="label text-xs">Custom Logo (File)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input text-sm p-1" 
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadingLogo(true)
                        try {
                          const res = await uploadApi.uploadFile(e.target.files[0])
                          setTabularSettings({...tabularSettings, logoUrl: res.data.url})
                        } catch (err) {
                          toast.error('Logo upload failed')
                        } finally {
                          setUploadingLogo(false)
                        }
                      }
                    }}
                  />
                  {uploadingLogo && <p className="text-xs text-brand-500 mt-1">Uploading...</p>}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label text-xs">Font Size</label>
                    <input 
                      type="number" 
                      value={tabularSettings.headerFontSize} 
                      onChange={e => setTabularSettings({...tabularSettings, headerFontSize: Number(e.target.value)})} 
                      className="input text-sm" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs">Color</label>
                    <input 
                      type="color" 
                      value={tabularSettings.headerColor} 
                      onChange={e => setTabularSettings({...tabularSettings, headerColor: e.target.value})} 
                      className="w-full h-9 rounded cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Logo Size (px)</label>
                  <input 
                    type="number" 
                    value={tabularSettings.logoSize} 
                    onChange={e => setTabularSettings({...tabularSettings, logoSize: Number(e.target.value)})} 
                    className="input text-sm" 
                  />
                </div>
                <div>
                  <label className="label text-xs">Address</label>
                  <textarea 
                    value={tabularSettings.address} 
                    onChange={e => setTabularSettings({...tabularSettings, address: e.target.value})} 
                    rows={2} 
                    className="input text-sm resize-none" 
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label text-xs">Phone</label>
                    <input 
                      value={tabularSettings.phone} 
                      onChange={e => setTabularSettings({...tabularSettings, phone: e.target.value})} 
                      className="input text-sm" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs">Mobile</label>
                    <input 
                      value={tabularSettings.mobile} 
                      onChange={e => setTabularSettings({...tabularSettings, mobile: e.target.value})} 
                      className="input text-sm" 
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label text-xs">Email</label>
                    <input 
                      value={tabularSettings.email} 
                      onChange={e => setTabularSettings({...tabularSettings, email: e.target.value})} 
                      className="input text-sm" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs">Website</label>
                    <input 
                      value={tabularSettings.website} 
                      onChange={e => setTabularSettings({...tabularSettings, website: e.target.value})} 
                      className="input text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Table Border</label>
                  <select 
                    value={tabularSettings.tableBorderColor} 
                    onChange={e => setTabularSettings({...tabularSettings, tableBorderColor: e.target.value})} 
                    className="input text-sm"
                  >
                    <option value="red">Red</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="label text-xs font-semibold mb-2">Column Headers</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={tabularSettings.headerSku} onChange={e => setTabularSettings({...tabularSettings, headerSku: e.target.value})} className="input text-xs" placeholder="SKU" />
                    <input value={tabularSettings.headerName} onChange={e => setTabularSettings({...tabularSettings, headerName: e.target.value})} className="input text-xs" placeholder="MODEL NO." />
                    <input value={tabularSettings.headerDesc} onChange={e => setTabularSettings({...tabularSettings, headerDesc: e.target.value})} className="input text-xs" placeholder="DESCRIPTION" />
                    <input value={tabularSettings.headerSize} onChange={e => setTabularSettings({...tabularSettings, headerSize: e.target.value})} className="input text-xs" placeholder="SIZE" />
                    <input value={tabularSettings.headerBrand} onChange={e => setTabularSettings({...tabularSettings, headerBrand: e.target.value})} className="input text-xs" placeholder="BRAND" />
                    <input value={tabularSettings.headerPrice} onChange={e => setTabularSettings({...tabularSettings, headerPrice: e.target.value})} className="input text-xs" placeholder="PRICE" />
                  </div>
                </div>
              </div>
            </div>

          {/* Templates - Only show for GRID */}
          {catalogueStyle === 'GRID' && (
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
          )}

          {/* Display Fields */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Display Fields</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(displayFields).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={e => setDisplayFields({ ...displayFields, [key]: e.target.checked as boolean })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="capitalize">{key}</span>
                </label>
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
              <div ref={printRef} className="print-wrapper bg-white w-full">
                {catalogueStyle === 'TABULAR' ? (
                  <CatalogueTabularView items={designerItems} settings={tabularSettings} displayFields={displayFields} />
                ) : (
                  <div className="w-full bg-white print:bg-white text-black font-sans">
                    <CatalogueHeader settings={tabularSettings} />
                    <div className="mt-4 p-4">
                      {(() => {
                        const groupedItems = designerItems.reduce((acc, di) => {
                          const typeName = di.item.itemType?.name || 'Uncategorized'
                          const subTypeName = di.item.itemSubType?.name || 'Uncategorized'
                          const groupKey = `${typeName} - ${subTypeName}`
                          
                          if (!acc[groupKey]) acc[groupKey] = []
                          
                          acc[groupKey].push(di)
                          return acc
                        }, {} as Record<string, DesignerItem[]>)
                        
                        return (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={designerItems.map(d => d.id)} strategy={rectSortingStrategy}>
                          <div className="space-y-8">
                            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                              <div key={groupName} className="mb-8">
                                <h2 className="text-center font-bold text-xl mb-4 uppercase" style={{ color: tabularSettings.tableBorderColor === 'black' ? '#000000' : '#dc2626' }}>
                                  {groupName}
                                </h2>
                                <div className={`grid ${gridCols} gap-3`}>
                                  {groupItems.map(di => (
                                    <SortableCard key={di.id} di={di} onRemove={() => removeItem(di.id)} onUpdate={(updates) => updateItem(di.id, updates)} displayFields={displayFields} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </SortableContext>
                          </DndContext>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
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
                          <img src={getImageUrl(item.images[0].url)} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
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

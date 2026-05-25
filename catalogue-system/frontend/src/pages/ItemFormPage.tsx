import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { itemsApi, lookupsApi } from '@/api/services'
import type { ItemRequest } from '@/types'

const schema = z.object({
  name:         z.string().min(1, 'Name is required'),
  sku:          z.string().optional(),
  description:  z.string().optional(),
  shortDesc:    z.string().optional(),
  price:        z.coerce.number().optional(),
  mrp:          z.coerce.number().optional(),
  currency:     z.string().default('INR'),
  discountPct:  z.coerce.number().optional(),
  typeId:       z.coerce.number().optional(),
  subTypeId:    z.coerce.number().optional(),
  sizeId:       z.coerce.number().optional(),
  brandId:      z.coerce.number().optional(),
  weight:       z.coerce.number().optional(),
  weightUnit:   z.string().optional(),
  dimensions:   z.string().optional(),
  color:        z.string().optional(),
  material:     z.string().optional(),
  countryOrigin: z.string().optional(),
  barcode:      z.string().optional(),
  stockQty:     z.coerce.number().default(0),
  isActive:     z.boolean().default(true),
  tagsRaw:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ItemFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: lookups } = useQuery({ queryKey: ['lookups'], queryFn: () => lookupsApi.getAll() })
  const { data: itemData, isLoading: loadingItem } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.get(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR', isActive: true, stockQty: 0 },
  })

  // Populate form when editing
  useEffect(() => {
    if (itemData?.data) {
      const i = itemData.data
      reset({
        name: i.name, sku: i.sku ?? '', description: i.description ?? '',
        shortDesc: i.shortDesc ?? '', price: i.price, mrp: i.mrp,
        currency: i.currency, discountPct: i.discountPct,
        typeId: i.itemType?.id, subTypeId: i.itemSubType?.id,
        sizeId: i.itemSize?.id, brandId: i.itemBrand?.id,
        weight: i.weight, weightUnit: i.weightUnit ?? '',
        dimensions: i.dimensions ?? '', color: i.color ?? '',
        material: i.material ?? '', countryOrigin: i.countryOrigin ?? '',
        barcode: i.barcode ?? '', stockQty: i.stockQty ?? 0,
        isActive: i.isActive, tagsRaw: i.tags?.join(', ') ?? '',
      })
    }
  }, [itemData, reset])

  const selectedTypeId = watch('typeId')
  const subTypes = lookups?.data?.subTypes?.filter(s => s.typeId === Number(selectedTypeId)) ?? []

  const mutation = useMutation({
    mutationFn: (data: ItemRequest) =>
      isEdit ? itemsApi.update(id!, data) : itemsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success(isEdit ? 'Item updated' : 'Item created')
      navigate('/items')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Save failed'),
  })

  const onSubmit = (data: FormData) => {
    const { tagsRaw, ...rest } = data
    const payload: ItemRequest = {
      ...rest,
      tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    mutation.mutate(payload)
  }

  if (isEdit && loadingItem) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-brand-500" /></div>
  }

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link to="/items" className="btn-ghost btn-sm p-1.5"><ArrowLeft size={16} /></Link>
          <h1 className="page-title">{isEdit ? 'Edit Item' : 'New Item'}</h1>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isEdit ? 'Save Changes' : 'Create Item'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 form-group">
              <label className="label">Item Name *</label>
              <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Product name" />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">SKU</label>
              <input {...register('sku')} className="input" placeholder="e.g. PRD-001" />
            </div>
            <div className="form-group">
              <label className="label">Barcode</label>
              <input {...register('barcode')} className="input" placeholder="EAN / UPC" />
            </div>
            <div className="col-span-2 form-group">
              <label className="label">Short Description</label>
              <input {...register('shortDesc')} className="input" placeholder="One-liner for catalogue cards" />
            </div>
            <div className="col-span-2 form-group">
              <label className="label">Full Description</label>
              <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Detailed description…" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Currency</label>
              <select {...register('currency')} className="input">
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Selling Price</label>
              <input {...register('price')} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="label">MRP</label>
              <input {...register('mrp')} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="label">Discount %</label>
              <input {...register('discountPct')} type="number" step="0.01" className="input" placeholder="0" />
            </div>
            <div className="form-group">
              <label className="label">Stock Qty</label>
              <input {...register('stockQty')} type="number" className="input" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Type</label>
              <select {...register('typeId')} className="input">
                <option value="">— Select type —</option>
                {lookups?.data?.types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Sub Type</label>
              <select {...register('subTypeId')} className="input" disabled={!selectedTypeId}>
                <option value="">— Select sub type —</option>
                {subTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Brand</label>
              <select {...register('brandId')} className="input">
                <option value="">— Select brand —</option>
                {lookups?.data?.brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Size</label>
              <select {...register('sizeId')} className="input">
                <option value="">— Select size —</option>
                {lookups?.data?.sizes?.map(s => <option key={s.id} value={s.id}>{s.label}{s.unit ? ` (${s.unit})` : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Physical */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Physical Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Weight</label>
              <input {...register('weight')} type="number" step="0.001" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Weight Unit</label>
              <select {...register('weightUnit')} className="input">
                <option value="">—</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Dimensions</label>
              <input {...register('dimensions')} className="input" placeholder="L×W×H cm" />
            </div>
            <div className="form-group">
              <label className="label">Color</label>
              <input {...register('color')} className="input" placeholder="e.g. Matte Black" />
            </div>
            <div className="form-group">
              <label className="label">Material</label>
              <input {...register('material')} className="input" placeholder="e.g. Stainless Steel" />
            </div>
            <div className="form-group">
              <label className="label">Country of Origin</label>
              <input {...register('countryOrigin')} className="input" placeholder="India" />
            </div>
          </div>
        </div>

        {/* Tags & status */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tags & Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 form-group">
              <label className="label">Tags <span className="text-slate-400 font-normal">(comma separated)</span></label>
              <input {...register('tagsRaw')} className="input" placeholder="new, sale, featured" />
            </div>
            <div className="form-group flex items-center gap-3 pt-2">
              <input {...register('isActive')} type="checkbox" id="isActive" className="w-4 h-4 rounded accent-brand-600" />
              <label htmlFor="isActive" className="label mb-0 cursor-pointer">Active (visible in catalogues)</label>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

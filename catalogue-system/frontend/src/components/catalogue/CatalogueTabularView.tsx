import React from 'react'
import type { Item } from '@/types'
import { getImageUrl } from '@/utils/imageUrl'
import CatalogueHeader from './CatalogueHeader'

interface DesignerItem {
  id: string
  item: Item
  position: number
  pageNumber: number
  customName?: string
  customPrice?: number
  customOverrides?: Record<string, any>
}

interface TabularSettings {
  logoUrl?: string
  companyName?: string
  phone?: string
  mobile?: string
  email?: string
  website?: string
  address?: string
  headerFontSize?: number
  headerColor?: string
  logoSize?: number
  tableBorderColor?: string
  headerSku?: string
  headerName?: string
  headerDesc?: string
  headerSize?: string
  headerBrand?: string
  headerPrice?: string
}

interface DisplayFields {
  name: boolean
  price: boolean
  sku: boolean
  size: boolean
  brand: boolean
  description: boolean
}

interface Props {
  items: DesignerItem[]
  settings: TabularSettings
  displayFields?: DisplayFields
}

export default function CatalogueTabularView({ items, settings, displayFields }: Props) {
  // Group items by "Type - SubType"
  const groupedItems = items.reduce((acc, di) => {
    const typeName = di.item.itemType?.name || 'Uncategorized'
    const subTypeName = di.item.itemSubType?.name || 'Uncategorized'
    const groupKey = `${typeName} - ${subTypeName}`
    
    if (!acc[groupKey]) acc[groupKey] = []
    
    acc[groupKey].push(di)
    return acc
  }, {} as Record<string, DesignerItem[]>)

  const borderColorClass = settings.tableBorderColor === 'black' ? 'border-black' : 'border-red-600'
  const textColorClass = settings.tableBorderColor === 'black' ? 'text-black' : 'text-red-600'

  return (
    <div className="w-full bg-white print:bg-white text-black font-sans print:m-0 print:p-0">
      <table className="w-full min-w-full print:w-full border-collapse">
        <thead className="print:table-header-group">
          <tr>
            <td className="p-0 border-0 mb-4 block print:border-0">
              <CatalogueHeader settings={settings} />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4">
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                  <div key={groupName} className="mb-6">
                    <h2 className={`text-center font-bold text-lg mb-2 uppercase ${textColorClass}`}>
                      {groupName}
                    </h2>
                    <table className={`w-full border-collapse border-2 ${borderColorClass}`}>
                      <thead>
                        <tr className="bg-slate-50">
                          {displayFields?.sku && <th className={`border ${borderColorClass} p-2 text-left font-semibold text-sm`}>{settings.headerSku || 'SKU'}</th>}
                          {displayFields?.name && <th className={`border ${borderColorClass} p-2 text-left font-semibold text-sm`}>{settings.headerName || 'MODEL NO.'}</th>}
                          {displayFields?.description && <th className={`border ${borderColorClass} p-2 text-left font-semibold text-sm`}>{settings.headerDesc || 'DESCRIPTION'}</th>}
                          {displayFields?.size && <th className={`border ${borderColorClass} p-2 text-center font-semibold text-sm`}>{settings.headerSize || 'SIZE'}</th>}
                          {displayFields?.brand && <th className={`border ${borderColorClass} p-2 text-center font-semibold text-sm`}>{settings.headerBrand || 'BRAND'}</th>}
                          {displayFields?.price && <th className={`border ${borderColorClass} p-2 text-right font-semibold text-sm`}>{settings.headerPrice || 'PRICE'}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {groupItems.map(di => (
                          <tr key={di.id} className="hover:bg-slate-50 transition-colors">
                            {displayFields?.sku && <td className={`border ${borderColorClass} p-2 text-sm`}>{di.item.sku || '-'}</td>}
                            {displayFields?.name && <td className={`border ${borderColorClass} p-2 text-sm`}>{di.customName || di.item.name || '-'}</td>}
                            {displayFields?.description && <td className={`border ${borderColorClass} p-2 text-sm text-slate-600`}>{di.item.shortDesc || di.item.description || '-'}</td>}
                            {displayFields?.size && <td className={`border ${borderColorClass} p-2 text-center text-sm`}>
                              {di.item.itemSize ? `${di.item.itemSize.label} ${di.item.itemSize.unit || ''}` : '-'}
                            </td>}
                            {displayFields?.brand && <td className={`border ${borderColorClass} p-2 text-center text-sm`}>
                               {di.item.itemBrand?.name || '-'}
                            </td>}
                            {displayFields?.price && <td className={`border ${borderColorClass} p-2 text-right text-sm font-medium`}>
                              {di.item.price != null ? `${(di.customPrice ?? di.item.price).toFixed(2)}` : '-'}
                            </td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

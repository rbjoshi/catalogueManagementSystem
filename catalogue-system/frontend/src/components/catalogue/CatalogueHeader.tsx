/*
 * Copyright (c) 2026. All rights reserved.
 */
import React from 'react'
import { getImageUrl } from '@/utils/imageUrl'

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
}

interface Props {
  settings: TabularSettings
}

export default function CatalogueHeader({ settings }: Props) {
  return (
    <div className="grid grid-cols-3 items-center py-4 px-2 w-full border-b-2 border-red-600 mb-4">
      <div className="flex items-center justify-start">
        {settings.logoUrl && (
          <img 
            src={getImageUrl(settings.logoUrl)} 
            alt="Logo" 
            style={{ height: `${settings.logoSize || 64}px` }} 
            className="object-contain"
          />
        )}
      </div>
      <div className="flex items-center justify-center text-center">
        <h1 
          style={{ 
            fontSize: `${settings.headerFontSize || 24}px`, 
            color: settings.headerColor || '#000000' 
          }} 
          className="font-bold uppercase tracking-wide m-0"
        >
          {settings.companyName || 'Company Name'}
        </h1>
      </div>
      <div className="text-right text-xs leading-tight flex flex-col items-end justify-center">
        <p>{settings.address}</p>
        {(settings.phone || settings.mobile) && (
          <p>
            {settings.phone && `Ph.: ${settings.phone}`}
            {settings.phone && settings.mobile && ' | '}
            {settings.mobile && `M: ${settings.mobile}`}
          </p>
        )}
        {settings.email && <p>E: {settings.email}</p>}
        {settings.website && <p>W: {settings.website}</p>}
      </div>
    </div>
  )
}

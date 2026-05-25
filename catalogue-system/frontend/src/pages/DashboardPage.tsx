import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, BookOpen, FileText, Plus, ArrowRight } from 'lucide-react'
import { itemsApi, cataloguesApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)

  const { data: itemsData } = useQuery({
    queryKey: ['items', 'summary'],
    queryFn: () => itemsApi.list({ size: 1 }),
  })

  const { data: catData } = useQuery({
    queryKey: ['catalogues', 'summary'],
    queryFn: () => cataloguesApi.list({ size: 1 }),
  })

  const { data: publishedData } = useQuery({
    queryKey: ['catalogues', 'published'],
    queryFn: () => cataloguesApi.list({ status: 'PUBLISHED', size: 1 }),
  })

  const stats = [
    { label: 'Total Items',        value: itemsData?.data?.totalElements ?? '—',  icon: Package,  color: 'bg-blue-50 text-blue-600'   },
    { label: 'Catalogues',         value: catData?.data?.totalElements ?? '—',    icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
    { label: 'Published',          value: publishedData?.data?.totalElements ?? '—', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Good day, {user?.firstName ?? user?.username} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{user?.companyName} · Enterprise ID: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{user?.entId}</code></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{label}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/items/new" className="card-hover p-6 flex items-center gap-4 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">Add Item</p>
            <p className="text-sm text-slate-400 mt-0.5">Add a product to your catalogue</p>
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link to="/catalogues/new" className="card-hover p-6 flex items-center gap-4 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">New Catalogue</p>
            <p className="text-sm text-slate-400 mt-0.5">Design and publish a catalogue</p>
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}

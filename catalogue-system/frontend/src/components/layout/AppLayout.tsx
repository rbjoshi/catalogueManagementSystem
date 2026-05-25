import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, BookOpen, Settings,
  LogOut, ChevronRight, Building2, Tag,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/items',             icon: Package,         label: 'Items' },
  { to: '/catalogues',        icon: BookOpen,        label: 'Catalogues' },
  { to: '/settings/lookups',  icon: Tag,             label: 'Lookups' },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">CatalogueHub</span>
          </div>
        </div>

        {/* Company badge */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-brand-50">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-brand-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-brand-700 truncate">{user?.companyName}</p>
              <p className="text-[10px] text-brand-500 font-mono truncate">{user?.entId}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 group">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
              {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut size={14} className="text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

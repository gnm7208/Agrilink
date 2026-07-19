import React from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Users2, FileText, ScrollText, ArrowLeft, Flag } from 'lucide-react'
import { AdminThemeProvider } from '../../context/AdminThemeContext'
import { AdminThemePicker } from './AdminThemePicker'
import { useAdminTheme } from '../../hooks/useTheme'
import { getAdminHeroImage } from '../../config/themes'

const TABS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/communities', icon: Users2, label: 'Communities' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
  { to: '/admin/reports', icon: Flag, label: 'Reports' },
  { to: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
]

export function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  )
}

function AdminLayoutInner() {
  const { theme } = useAdminTheme()
  const heroImage = getAdminHeroImage(theme)

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Ambient theme-colored glow — purely decorative, sits behind all content */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 dark:opacity-20 bg-green-400" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-15 bg-amber-400" />
      </div>

      <header
        className="sticky top-0 z-40 text-white px-4 py-3 flex items-center justify-between bg-cover bg-center"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className={`absolute inset-0 ${heroImage ? 'bg-black/55 backdrop-blur-sm' : 'bg-slate-900'}`} />
        <div className="relative flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Back to app">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold tracking-tight text-green-600">Admin Dashboard</h1>
        </div>
        <div className="relative">
          <AdminThemePicker />
        </div>
      </header>

      <nav className="sticky top-[49px] z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-2 overflow-x-auto">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`
              }
            >
              <tab.icon size={16} />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-4 py-6 text-gray-900">
        <Outlet />
      </main>
    </div>
  )
}

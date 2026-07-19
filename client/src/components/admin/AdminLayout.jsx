import React from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Users2, FileText, ScrollText, ArrowLeft, Flag } from 'lucide-react'
import { AdminThemeProvider } from '../../context/AdminThemeContext'
import { AdminThemePicker } from './AdminThemePicker'

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Back to app">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <AdminThemePicker />
        </header>

        <nav className="sticky top-[49px] z-30 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-2 overflow-x-auto">
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

        <main className="max-w-5xl mx-auto px-4 py-6 text-gray-900">
          <Outlet />
        </main>
      </div>
    </AdminThemeProvider>
  )
}

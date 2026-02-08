import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  PlusSquare,
  MessageSquare,
  User,
  Sprout,
  LogOut,
  Settings,
} from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import { Avatar } from './ui/Avatar'
import { useAuth } from '../hooks/useAuth'

const SideNav = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'communities', icon: Users, label: 'Communities', path: '/communities' },
    { id: 'create', icon: PlusSquare, label: 'Create', path: '/create', primary: true },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <aside className="
  hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col
  bg-white/40
  backdrop-blur-xl
  border-r border-white/10
  shadow-2xl
  z-50
">
     
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-green-600 text-white shadow-lg">
          <Sprout size={22} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Agrilink</h1>
      </div>

      
      <nav className="flex-1 px-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group overflow-hidden ${
                isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              } ${tab.primary ? 'mt-4' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-500/80 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="relative z-10">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="relative z-10 font-medium text-sm">
                {tab.label}
              </span>

              {tab.primary && (
                <span className="ml-auto relative z-10 text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                  New
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER / USER */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition group cursor-pointer">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
          ) : user ? (
            <>
              <Avatar
                src={user.profile_image_url}
                fallback={user.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-white/60 truncate">
                  @{(user.role || 'user').toLowerCase()}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <Link to="/login" className="text-sm font-semibold text-white hover:underline">
                Sign in
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/50">
            <Settings size={16} className="hover:text-white" />
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="p-0 border-0 bg-transparent cursor-pointer"
              >
                <LogOut size={16} className="hover:text-red-400 transition" />
              </button>
            ) : (
              <Link to="/login">
                <LogOut size={16} className="hover:text-red-400 transition" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SideNav

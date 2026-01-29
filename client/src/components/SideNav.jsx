import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  PlusSquare,
  MessageSquare,
  User,
  Sprout,
  LogOut,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar } from './ui/Avatar'
import { currentUser } from '../data/mockData'

const SideNav = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'communities', icon: Users, label: 'Communities', path: '/communities' },
    { id: 'create', icon: PlusSquare, label: 'Create Post', path: '/create' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 z-50">
      
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
          <Sprout size={24} />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          AgriConnect
        </span>
      </div>

     
      <nav className="flex-1 px-4 py-6 space-y-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidenav-indicator"
                  className="absolute left-0 w-1 h-8 bg-green-500 rounded-r-full"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>

     
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <Avatar
            src={currentUser.avatar}
            fallback={currentUser.name}
            size="md"
          />

          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{currentUser.role.toLowerCase()}
            </p>
          </div>

          <LogOut
            size={18}
            className="text-gray-400 group-hover:text-red-500 transition-colors"
          />
        </div>
      </div>
    </aside>
  )
}

export default SideNav
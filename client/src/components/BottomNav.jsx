import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, PlusSquare, MessageSquare, User } from 'lucide-react'
import { motion } from 'framer-motion'

const BottomNav = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'communities', icon: Users, label: 'Groups', path: '/communities' },
    { id: 'create', icon: PlusSquare, label: 'Post', path: '/create' },
    { id: 'messages', icon: MessageSquare, label: 'Chat', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 h-16 px-2">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] w-8 h-1 bg-green-500 rounded-b-full"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              <div
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px]">{tab.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
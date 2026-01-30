import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Edit } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { messages } from '../data/mockData'

export function MessagesList() {
  return (
    <div className="min-h-screen bg-white pb-24">
     
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            Messages
          </h1>

          <button className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
            <Edit size={20} />
          </button>
        </div>

        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </header>

    
      <div className="divide-y divide-gray-50">
        {messages.map((msg) => (
          <Link
            key={msg.id}
            to={`/chat/${msg.id}`}
            className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={msg.sender.avatar}
                fallback={msg.sender.name}
                size="lg"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

          
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {msg.sender.name}
                </h3>
                <span
                  className={`text-xs ${
                    msg.unread > 0
                      ? 'text-green-600 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p
                  className={`text-sm truncate ${
                    msg.unread > 0
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {msg.lastMessage}
                </p>

                {msg.unread > 0 && (
                  <span className="ml-2 flex items-center justify-center w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                    {msg.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

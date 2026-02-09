<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Edit, Loader2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export function MessagesList() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.messages.conversations)
      setConversations(response.conversations || [])
    } catch (err) {
      setError(err.message || 'Failed to load conversations')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    if (diffMs < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffMs < 172800000) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No conversations yet.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {conversations.map((conv) => (
            <Link
              key={conv.user_id}
              to={`/chat/${conv.user_id}`}
              className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <Avatar
                  src={conv.user?.profile_image_url}
                  fallback={conv.user?.username}
                  size="lg"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.user?.username || 'Unknown'}
                  </h3>
                  <span
                    className={`text-xs ${
                      conv.unread_count > 0 ? 'text-green-600 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {conv.last_message?.created_at
                      ? formatTime(conv.last_message.created_at)
                      : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {conv.last_message?.content || ''}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="ml-2 flex items-center justify-center w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
=======
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Edit } from "lucide-react"
import { Avatar } from "../components/ui/Avatar"
import { Card } from "../components/ui/Card"
import { messages } from "../data/mockData"

export function MessagesList() {
  const [query, setQuery] = useState("")

  const filteredMessages = messages.filter(
    (msg) =>
      msg.sender.name.toLowerCase().includes(query.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)",
      }}
    >
      {/* Dark glass overlay */}
      <div className="min-h-screen bg-black/40 backdrop-blur-md ml-64 pb-16">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-white/10 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Messages
              </h1>

              <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                <Edit size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search conversations..."
                className="
                  w-full rounded-2xl bg-white/10 backdrop-blur-xl
                  pl-11 pr-4 py-3 text-sm text-white
                  placeholder-white/50
                  border border-white/10
                  focus:outline-none focus:ring-2 focus:ring-green-500/40
                "
              />
            </div>
          </div>
        </header>

        {/* Messages list */}
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-3">
          {filteredMessages.length === 0 && (
            <div className="text-center text-sm text-white/70 py-16">
              No conversations found 🌱
            </div>
          )}

          {filteredMessages.map((msg) => (
            <Link key={msg.id} to={`/chat/${msg.id}`}>
              <Card
                noPadding
                className={`
                  flex items-center gap-4 p-4
                  rounded-2xl cursor-pointer
                  bg-white/10 backdrop-blur-xl
                  border border-white/10
                  hover:bg-white/15 transition
                  ${msg.unread > 0 ? "ring-1 ring-green-400/40" : ""}
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar
                    src={msg.sender.avatar}
                    fallback={msg.sender.name}
                    size="lg"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-black/30 rounded-full" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {msg.sender.name}
                    </h3>
                    <span className="text-xs text-white/50">
                      {msg.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        msg.unread > 0
                          ? "text-white font-medium"
                          : "text-white/60"
                      }`}
                    >
                      {msg.lastMessage}
                    </p>

                    {msg.unread > 0 && (
                      <span className="ml-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-green-500 text-black text-[10px] font-bold rounded-full">
                        {msg.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
>>>>>>> 59187ef (initial commit)
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Edit, Loader2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export function MessagesList() {
  const [query, setQuery] = useState('')
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(
        API_ENDPOINTS.messages.conversations
      )
      setConversations(response.conversations || [])
    } catch (err) {
      setError(err.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.user?.username?.toLowerCase() || ''
    const last = conv.last_message?.content?.toLowerCase() || ''
    return (
      name.includes(query.toLowerCase()) ||
      last.includes(query.toLowerCase())
    )
  })

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-md ml-64 pb-16">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-white/10 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">
                Messages
              </h1>
              <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <Edit size={18} />
              </button>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-2xl bg-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-red-400 py-12">
              {error}
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-center text-white/70 py-16">
              No conversations found 🌱
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <Link
                key={conv.user_id}
                to={`/chat/${conv.user_id}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/15 transition"
              >
                <div className="relative">
                  <Avatar
                    src={conv.user?.profile_image_url}
                    fallback={conv.user?.username}
                    size="lg"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black/30" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {conv.user?.username || 'Unknown'}
                    </h3>
                    <span className="text-xs text-white/50">
                      {conv.last_message?.created_at
                        ? new Date(
                            conv.last_message.created_at
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm truncate text-white/70">
                      {conv.last_message?.content || ''}
                    </p>

                    {conv.unread_count > 0 && (
                      <span className="ml-3 min-w-[20px] h-5 px-1.5 bg-green-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

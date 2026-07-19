import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Edit, Loader2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export function MessagesList() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showComposer, setShowComposer] = useState(false)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    fetchConversations()
    // Poll for new conversations/messages so unread badges update without a manual reload.
    const interval = setInterval(() => fetchConversations(true), 8000)
    return () => clearInterval(interval)
  }, [])

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.messages.conversations)
      setConversations(response.conversations || [])
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to load conversations')
        setConversations([])
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const openComposer = async () => {
    setShowComposer(true)
    setUsers([])
    // Use the search endpoint instead of the admin-only list endpoint
    try {
      const res = await apiRequest(`${API_ENDPOINTS.users.list}/search?q=`)
      // API returns list in res.users or res
      const list = res.users || res || []
      setUsers(list.filter(u => u && u.id))
    } catch {
      setUsers([])
    }
  }

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setUsers([])
      return
    }
    try {
      const res = await apiRequest(`${API_ENDPOINTS.users.list}/search?q=${encodeURIComponent(query)}`)
      const list = res.users || res || []
      setUsers(list.filter(u => u && u.id))
    } catch {
      setUsers([])
    }
  }

  const handleStartChat = (userId) => {
    setShowComposer(false)
    navigate(`/chat/${userId}`)
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
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={openComposer}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            title="New message"
          >
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

        {/* Composer modal */}
        {showComposer && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
                <button onClick={() => setShowComposer(false)} className="text-gray-500">Close</button>
              </div>
              <input
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value)
                  handleSearch(e.target.value)
                }}
                placeholder="Search users..."
                className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded"
              />
              <div className="max-h-64 overflow-y-auto">
                {users.filter(u => (u.username || '').toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.profile_image_url} fallback={u.username} size="sm" />
                      <div>
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs text-gray-500">{u.role}</div>
                      </div>
                    </div>
                    <button onClick={() => handleStartChat(u.id)} className="bg-green-600 text-white px-3 py-1 rounded">Message</button>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

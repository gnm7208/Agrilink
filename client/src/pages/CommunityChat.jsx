import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Users } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function CommunityChat() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
  const [community, setCommunity] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchCommunity = useCallback(async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.communities.byId(id))
      setCommunity(data)
    } catch {
      setCommunity({ name: 'Community' })
    }
  }, [id])

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.messages.inCommunity(id))
      const msgs = response.messages || []
      setChatHistory(
        msgs.map((m) => ({
          id: m.id,
          message: m.content,
          senderName: m.sender?.username || 'Unknown',
          time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          isSent: m.sender_id === currentUser?.id,
        }))
      )
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to load messages')
        setChatHistory([])
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [id, currentUser?.id])

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  useEffect(() => {
    if (currentUser?.id) fetchMessages()
  }, [currentUser?.id, fetchMessages])

  useEffect(() => {
    if (!currentUser?.id) return
    const interval = setInterval(() => fetchMessages(true), 5000)
    return () => clearInterval(interval)
  }, [currentUser?.id, fetchMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const content = input.trim()
    setInput('')

    try {
      await apiRequest(API_ENDPOINTS.messages.send, {
        method: 'POST',
        body: JSON.stringify({ content, community_id: parseInt(id, 10) }),
      })
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: content,
          senderName: currentUser?.username,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: true,
        },
      ])
    } catch (err) {
      setError(err.message || 'Failed to send message')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm">
        <Link to={`/communities/${id}`} className="p-1">
          <ArrowLeft size={24} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
          <Users size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate text-gray-900">{community?.name || 'Loading...'}</h2>
          <p className="text-xs text-gray-400">Group chat</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && <p className="text-center text-gray-400 mt-10">Loading messages...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        {!loading && !error && chatHistory.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No messages yet. Say hello!</p>
        )}
        {chatHistory.map((msg) => (
          <div key={msg.id}>
            {!msg.isSent && (
              <p className="text-xs text-gray-400 ml-1 mb-0.5">{msg.senderName}</p>
            )}
            <ChatBubble message={msg.message} time={msg.time} isSent={msg.isSent} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-t dark:border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the group..."
          className="flex-1 rounded-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 text-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-full bg-green-600 text-white disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

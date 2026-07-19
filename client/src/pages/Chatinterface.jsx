// Your ChatInterface was already correct — keeping same structure
// (No lint conflict patterns found)

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Flag,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import ChatBubble from '../components/ChatBubble'
import { ReportModal } from '../components/ReportModal'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function ChatInterface() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
  const [chatUser, setChatUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const messagesEndRef = useRef(null)

  const fetchOtherUser = useCallback(async () => {
    try {
      const userData = await apiRequest(API_ENDPOINTS.users.byId(userId))
      setChatUser(userData)
    } catch {
      setChatUser({ username: 'Unknown', profile_image_url: null })
    }
  }, [userId])

  const fetchConversation = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.messages.withUser(userId))
      const msgs = response.messages || []
      setChatHistory(
        msgs.map((m) => ({
          id: m.id,
          message: m.content,
          time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
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
  }, [userId, currentUser?.id])

  useEffect(() => {
    if (userId) fetchOtherUser()
  }, [userId, fetchOtherUser])

  useEffect(() => {
    if (userId && currentUser?.id) fetchConversation()
  }, [userId, currentUser?.id, fetchConversation])

  useEffect(() => {
    if (!userId || !currentUser?.id) return
    // Poll so the other side's replies show up without a manual reload.
    const interval = setInterval(() => fetchConversation(true), 5000)
    return () => clearInterval(interval)
  }, [userId, currentUser?.id, fetchConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !userId) return

    const content = input.trim()
    setInput('')

    try {
      await apiRequest(API_ENDPOINTS.messages.send, {
        method: 'POST',
        body: JSON.stringify({
          content,
          receiver_id: parseInt(userId, 10),
        }),
      })

      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: content,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isSent: true,
        },
      ])
    } catch (err) {
      setError(err.message || 'Failed to send message')
    }
  }

  if (!chatUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm">
        <Link to="/messages" className="p-1">
          <ArrowLeft size={24} />
        </Link>
        <Avatar
          src={chatUser?.profile_image_url}
          alt={chatUser?.username}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate text-gray-900">
            {chatUser?.username || 'Loading...'}
          </h2>
        </div>
        <button className="p-2 text-gray-500">
          <Phone size={20} />
        </button>
        <button className="p-2 text-gray-500">
          <Video size={20} />
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu((v) => !v)} aria-label="Chat options" className="p-2 text-gray-500">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowReport(true)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <Flag size={14} className="text-red-500" />
                  Report user
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showReport && userId && (
        <ReportModal
          targetType="user"
          targetId={parseInt(userId, 10)}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && (
          <p className="text-center text-gray-400 mt-10">Loading messages...</p>
        )}
        {error && (
          <p className="text-center text-red-500 mt-4">{error}</p>
        )}
        {!loading && !error && chatHistory.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No messages yet. Say hello!
          </p>
        )}
        {chatHistory.map((msg) => (
          <ChatBubble 
            key={msg.id} 
            message={msg.message}
            time={msg.time}
            isSent={msg.isSent}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-t dark:border-slate-800"
      >
        <button type="button" className="p-2 text-gray-500">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
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

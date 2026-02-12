import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import ChatBubble from '../components/ChatBubble'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function ChatInterface() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
  const [chatUser, setChatUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchOtherUser = useCallback(async () => {
    try {
      const userData = await apiRequest(API_ENDPOINTS.users.byId(userId))
      setChatUser(userData)
    } catch {
      setChatUser({ username: 'Unknown', profile_image_url: null })
    }
  }, [userId])

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true)
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
      setError(err.message || 'Failed to load messages')
      setChatHistory([])
    } finally {
      setLoading(false)
    }
  }, [userId, currentUser?.id])

  useEffect(() => {
    if (userId) {
      fetchOtherUser()
    }
  }, [userId, fetchOtherUser])

  useEffect(() => {
    if (userId && currentUser?.id) {
      fetchConversation()
    }
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
        body: JSON.stringify({ content, receiver_id: parseInt(userId, 10) }),
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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>

          <Avatar
            src={chatUser?.profile_image_url}
            fallback={chatUser?.username}
            size="sm"
          />

          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {chatUser?.username || 'Unknown'}
            </h3>
            <span className="text-xs text-green-600 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1" />
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
          <Phone size={20} />
          <Video size={20} />
          <MoreVertical size={20} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            {chatHistory.map((chat) => (
              <ChatBubble key={chat.id} {...chat} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="bg-white border-t border-gray-100 p-4 pb-safe">
        <form
          onSubmit={handleSend}
          className="flex items-center space-x-3 max-w-4xl mx-auto"
        >
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Paperclip size={24} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}

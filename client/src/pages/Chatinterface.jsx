import React, { useEffect, useState, useRef } from 'react'
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

  const fetchOtherUser = async () => {
    try {
      const userData = await apiRequest(
        API_ENDPOINTS.users.byId(userId)
      )
      setChatUser(userData)
    } catch {
      setChatUser({ username: 'Unknown', profile_image_url: null })
    }
  }

  const fetchConversation = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(
        API_ENDPOINTS.messages.withUser(userId)
      )

      setChatHistory(
        (response.messages || []).map((m) => ({
          id: m.id,
          message: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isSent: m.sender_id === currentUser?.id,
        }))
      )
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) fetchOtherUser()
  }, [userId])

  useEffect(() => {
    if (userId && currentUser?.id) fetchConversation()
  }, [userId, currentUser?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const content = input.trim()
    setInput('')

    await apiRequest(API_ENDPOINTS.messages.send, {
      method: 'POST',
      body: JSON.stringify({
        content,
        receiver_id: Number(userId),
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
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="bg-black/40 backdrop-blur-md ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft size={22} />
              </button>

              <Avatar
                src={chatUser?.profile_image_url}
                fallback={chatUser?.username}
                size="sm"
              />

              <div>
                <h3 className="font-semibold text-white text-sm">
                  {chatUser?.username}
                </h3>
                <span className="text-xs text-green-400 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <Phone size={18} />
              <Video size={18} />
              <MoreVertical size={18} />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 px-4 py-6 max-w-5xl mx-auto space-y-4 overflow-y-auto">
          {chatHistory.map((chat) => (
            <ChatBubble key={chat.id} {...chat} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-white/10 backdrop-blur-xl px-4 py-4">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 max-w-5xl mx-auto"
          >
            <Paperclip className="text-white/50" size={20} />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 border border-white/10 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 rounded-full bg-green-600 text-white hover:bg-green-500 shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

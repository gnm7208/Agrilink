import React, { useEffect, useState } from 'react'
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
<<<<<<< HEAD
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'
=======
import { messages } from '../data/mockData'
>>>>>>> 59187ef (initial commit)

export function ChatInterface() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
<<<<<<< HEAD
  const [chatUser, setChatUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchOtherUser = async () => {
    try {
      const userData = await apiRequest(API_ENDPOINTS.users.byId(userId))
      setChatUser(userData)
    } catch {
      setChatUser({ username: 'Unknown', profile_image_url: null })
    }
  }

  const fetchConversation = async () => {
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
  }

  useEffect(() => {
    if (userId) {
      fetchOtherUser()
    }
  }, [userId])

  useEffect(() => {
    if (userId && currentUser?.id) {
      fetchConversation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchConversation uses currentUser from closure
  }, [userId, currentUser?.id])

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
=======

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      message: 'Hi! I saw your post about organic fertilizers.',
      time: '10:00 AM',
      isSent: false,
    },
    {
      id: 2,
      message: "Yes! It's been working really well for my tomatoes.",
      time: '10:05 AM',
      isSent: true,
    },
    {
      id: 3,
      message: "That's great. Could you share the specific brand you're using?",
      time: '10:06 AM',
      isSent: false,
    },
    {
      id: 4,
      message: "I'm using GreenLife Organic Mix. Highly recommend it!",
      time: '10:08 AM',
      isSent: true,
    },
  ])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setChatHistory([
      ...chatHistory,
      {
        id: Date.now(),
        message: input,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: true,
      },
    ])
>>>>>>> 59187ef (initial commit)
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

<<<<<<< HEAD
  if (!chatUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
=======
  const chatUser =
    messages.find((m) => m.id === id)?.sender || messages[0].sender
>>>>>>> 59187ef (initial commit)

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="bg-black/40 backdrop-blur-md ml-64 min-h-screen">
        
        <header className="border-b border-white/10 bg-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white/70 hover:text-white transition"
              >
                <ArrowLeft size={22} />
              </button>

<<<<<<< HEAD
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
=======
              <Avatar
                src={chatUser.avatar}
                fallback={chatUser.name}
                size="sm"
              />

              <div>
                <h3 className="font-semibold text-white text-sm">
                  {chatUser.name}
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
>>>>>>> 59187ef (initial commit)
          </div>
        </header>

       
        <div className="px-4 py-6 max-w-5xl mx-auto space-y-4">
          {chatHistory.map((chat) => (
            <ChatBubble key={chat.id} {...chat} />
          ))}
        </div>

<<<<<<< HEAD
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
=======
        
        <div className="border-t border-white/10 bg-white/10 backdrop-blur-xl px-4 py-4">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 max-w-5xl mx-auto"
>>>>>>> 59187ef (initial commit)
          >
            <button
              type="button"
              className="text-white/50 hover:text-white transition"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="
                flex-1 rounded-full bg-white/10 backdrop-blur-xl
                px-4 py-3 text-sm text-white
                placeholder-white/50
                border border-white/10
                focus:outline-none focus:ring-2 focus:ring-green-500/40
              "
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="
                p-3 rounded-full bg-green-600 text-white
                hover:bg-green-500 transition
                disabled:opacity-50
                shadow-lg shadow-green-600/30
              "
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

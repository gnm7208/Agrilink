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
import  ChatBubble  from '../components/ChatBubble'
import { messages } from '../data/mockData'

export function ChatInterface() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

 
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

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

    setInput('')
  }

  // Find user details from mock data
  const chatUser =
    messages.find((m) => m.id === id)?.sender || messages[0].sender

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
            src={chatUser.avatar}
            fallback={chatUser.name}
            size="sm"
          />

          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {chatUser.name}
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
        {chatHistory.map((chat) => (
          <ChatBubble key={chat.id} {...chat} />
        ))}
        <div ref={messagesEndRef} />
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

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
import { messages } from '../data/mockData'

export function ChatInterface() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')

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
    setInput('')
  }

  const chatUser =
    messages.find((m) => m.id === id)?.sender || messages[0].sender

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
          </div>
        </header>

       
        <div className="px-4 py-6 max-w-5xl mx-auto space-y-4">
          {chatHistory.map((chat) => (
            <ChatBubble key={chat.id} {...chat} />
          ))}
        </div>

        
        <div className="border-t border-white/10 bg-white/10 backdrop-blur-xl px-4 py-4">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 max-w-5xl mx-auto"
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

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Users,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import ChatBubble from '../components/ChatBubble'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function ChatInterface() {
  const { userId, communityId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
  const [chatUser, setChatUser] = useState(null)
  const [chatCommunity, setChatCommunity] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const messagesEndRef = useRef(null)
  const isCommunityChat = !!communityId

  useEffect(() => {
    if (isCommunityChat && communityId) {
      apiRequest(API_ENDPOINTS.communities.byId(communityId))
        .then(setChatCommunity)
        .catch(() =>
          setChatCommunity({ name: 'Unknown Community', image_url: null })
        )
    } else if (userId) {
      apiRequest(API_ENDPOINTS.users.byId(userId))
        .then(setChatUser)
        .catch(() =>
          setChatUser({ username: 'Unknown', profile_image_url: null })
        )
    }
  }, [userId, communityId, isCommunityChat])

  useEffect(() => {
    if (!currentUser?.id) return

    if (isCommunityChat && communityId) {
      apiRequest(API_ENDPOINTS.messages.inCommunity(communityId)).then((res) => {
        setChatHistory(
          (res.messages || []).map((m) => ({
            id: m.id,
            message: m.content,
            isSent: m.sender_id === currentUser.id,
            sender: m.sender_id,
          }))
        )
      })
    } else if (userId) {
      apiRequest(API_ENDPOINTS.messages.withUser(userId)).then((res) => {
        setChatHistory(
          (res.messages || []).map((m) => ({
            id: m.id,
            message: m.content,
            isSent: m.sender_id === currentUser.id,
          }))
        )
      })
    }
  }, [userId, communityId, currentUser?.id, isCommunityChat])

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

    const messageBody = isCommunityChat
      ? { content, community_id: Number(communityId) }
      : { content, receiver_id: Number(userId) }

    try {
      await apiRequest(API_ENDPOINTS.messages.send, {
        method: 'POST',
        body: JSON.stringify(messageBody),
      })

      setChatHistory((prev) => [
        ...prev,
        { id: Date.now(), message: content, isSent: true },
      ])
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-md ml-64 flex flex-col">
      <header className="border-b border-white/10 bg-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft size={22} />
            </button>

            {isCommunityChat ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                  <Users size={16} className="text-green-400" />
                </div>
                <span className="text-white font-semibold text-sm">
                  {chatCommunity?.name || 'Community'}
                </span>
              </>
            ) : (
              <>
                <Avatar
                  src={chatUser?.profile_image_url}
                  fallback={chatUser?.username}
                  size="sm"
                />
                <span className="text-white font-semibold text-sm">
                  {chatUser?.username}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-4 text-white/70">
            <Phone size={18} />
            <Video size={18} />
            <MoreVertical size={18} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto space-y-4">
        {chatHistory.map((chat) => (
          <ChatBubble key={chat.id} {...chat} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-white/10 bg-white/10 px-4 py-4 flex gap-3 max-w-5xl mx-auto w-full"
      >
        <button type="button" className="text-white/50 hover:text-white">
          <Paperclip size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 border border-white/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 rounded-full bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

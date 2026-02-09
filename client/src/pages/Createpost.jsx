import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Hash, Loader2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function CreatePost() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('Advice')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please write something before posting')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim(), tag }),
      })
      navigate('/')
    } catch {
      setError('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-sm lg:ml-[250px] p-6">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/10 text-white">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What’s growing on your farm today?"
            className="w-full bg-transparent resize-none p-4 text-sm focus:outline-none"
            rows={4}
          />

          <div className="flex gap-2 p-4 pt-0">
            {['Advice', 'Question', 'Marketplace'].map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full ${
                  tag === t
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <Hash size={12} />
                {t}
              </button>
            ))}
          </div>

          {error && (
            <p className="px-4 pb-2 text-xs text-red-300">{error}</p>
          )}

          <div className="p-4 pt-0 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-500"
            >
              {isSubmitting ? 'Posting…' : 'Publish'}
            </Button>
          </div>
        </Card>
      </Motion.div>
    </div>
  )
}

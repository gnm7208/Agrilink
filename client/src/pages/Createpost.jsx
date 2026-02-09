import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImagePlus,
  X,
  Sprout,
  MapPin,
  Leaf,
  Camera,
  Hash,
  Loader2,
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'

import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function CreatePost() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('Advice')
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  const addImage = (e) => {
    const files = Array.from(e.target.files)
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please write something before posting')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const postData = {
        content: text.trim(),
        tag,
      }

      await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify(postData),
      })

      navigate('/')
    } catch (err) {
      setError('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm pb-24 lg:ml-[250px]">
        <div className="pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-5xl px-6 lg:px-8"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Create a post
                </p>
                <p className="text-xs text-white/60">
                  Inspire the Agrilink community
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-green-600 px-6 hover:bg-green-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Publish'}
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Main Card */}
            <Card
              noPadding
              className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl text-white"
            >
              {/* Image previews */}
              {images.length > 0 && (
                <div className="columns-2 md:columns-3 gap-2 p-2">
                  <AnimatePresence>
                    {images.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative mb-2 break-inside-avoid"
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-full rounded-xl object-cover"
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Content */}
              <div className="space-y-4 p-5">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What’s growing on your farm today?"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {['Advice', 'Question', 'Marketplace', 'Success Story'].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${
                          tag === t
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <Hash size={12} />
                        {t}
                      </button>
                    )
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/20">
                      <ImagePlus size={14} />
                      Images
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={addImage}
                      />
                    </label>

                    <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/20">
                      <Camera size={14} />
                      Camera
                    </button>

                    <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/20">
                      <MapPin size={14} />
                      Location
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-green-300">
                    <Leaf size={14} />
                    Agrilink verified content
                  </div>
                </div>
              </div>
            </Card>

           
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                'Maize yield tips',
                'Organic farming',
                'Market prices',
                'Irrigation hacks',
              ].map((idea) => (
                <motion.div
                  key={idea}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <Sprout className="mb-2 text-green-400" size={20} />
                  <p className="text-xs font-semibold text-white">{idea}</p>
                  <p className="mt-1 text-[11px] text-white/50">
                    Trending topic
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

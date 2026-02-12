import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Hash, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'
import { useMultiImageUpload } from '../hooks/useImageUpload'

export function CreatePost() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('Advice')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const {
    files,
    previews,
    uploading: imageUploading,
    error: imageError,
    uploadedUrls,
    handleFileSelect,
    clearFiles,
    removeFileAtIndex,
    uploadAll,
  } = useMultiImageUpload()

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
      let imageUrls = uploadedUrls.length > 0 ? [...uploadedUrls] : []

      if (files.length > 0 && imageUrls.length === 0) {
        imageUrls = await uploadAll()
      }

      const body = {
        content: text.trim(),
        tag,
      }
      if (imageUrls.length > 0) {
        body.image_urls = imageUrls
      }

      await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to create post')
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
            placeholder="What's growing on your farm today?"
            className="w-full bg-transparent resize-none p-4 text-sm focus:outline-none"
            rows={4}
          />

          {(previews.length > 0 || uploadedUrls.length > 0) && (
            <div className="mx-4 mb-4 flex flex-wrap gap-2">
              {(uploadedUrls.length > 0 ? uploadedUrls : previews).map((src, index) => (
                <div key={index} className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFileAtIndex(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 pb-2">
            <label className="flex items-center gap-2 text-white/70 hover:text-white cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={imageUploading}
              />
              <ImageIcon size={18} />
              <span className="text-xs">
                {imageUploading
                  ? 'Uploading...'
                  : files.length > 0
                    ? `Add more (${files.length} selected)`
                    : 'Add images'}
              </span>
            </label>
            {files.length > 0 && (
              <button
                type="button"
                onClick={clearFiles}
                className="ml-2 text-xs text-white/60 hover:text-white"
              >
                Clear all
              </button>
            )}
            {imageError && (
              <p className="text-xs text-red-300 mt-1">{imageError}</p>
            )}
          </div>

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
              disabled={isSubmitting || imageUploading}
              className="bg-green-600 hover:bg-green-500"
            >
              {isSubmitting || imageUploading ? 'Posting\u2026' : 'Publish'}
            </Button>
          </div>
        </Card>
      </Motion.div>
    </div>
  )
}

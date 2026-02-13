import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Hash, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function CreatePost() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('Advice')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  const uploadImageToImgur = async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID a3d26c7c0e8d1f5',
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        return data.data.link
      }
      throw new Error('Image upload failed')
    } catch (error) {
      console.error('Imgur upload error:', error)
      throw error
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 4) {
      setError('Maximum 4 images allowed')
      return
    }

    setImages([...images, ...files])

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
    setError(null)
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please write something before posting')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let imageUrl = null

      if (images.length > 0) {
        imageUrl = await uploadImageToImgur(images[0])
      }

      await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify({
          content: text.trim(),
          tag,
          image_url: imageUrl,
        }),
      })

      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to create post')
      console.error('Post creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-xl">
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-white">Create Post</h1>
          <button onClick={() => navigate('/')}>
            <X className="text-white/80 hover:text-white" size={24} />
          </button>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/10 text-white overflow-hidden">
              <div className="p-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's growing on your farm today?"
                  className="w-full bg-transparent resize-none text-white placeholder-white/60 focus:outline-none text-base"
                  rows={8}
                />
              </div>

              {imagePreviews.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.slice(0, 1).map((preview, index) => (
                      <div key={index} className="relative group col-span-2">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <p className="text-xs text-white/60 mt-2">
                      Note: Only the first image will be uploaded
                    </p>
                  )}
                </div>
              )}

              <div className="px-6 pb-4">
                <p className="text-xs text-white/60 mb-2">Select a tag:</p>
                <div className="flex flex-wrap gap-2">
                  {['Advice', 'Question', 'Marketplace'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTag(t)}
                      className={`flex items-center gap-1 px-4 py-2 text-sm rounded-full transition-all ${
                        tag === t
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Hash size={14} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-red-300 bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                </div>
              )}

              <div className="px-6 pb-6 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white transition-colors">
                    <ImageIcon size={20} />
                    <span className="text-sm">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={images.length >= 1}
                    />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !text.trim()}
                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Publish'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </Motion.div>
        </div>
      </div>
    </div>
  )
}
<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { useImageUpload } from '../hooks/useImageUpload';
import { useAuth } from '../hooks/useAuth';

export function CreatePost() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const addImage = (e) => {
    const files = Array.from(e.target.files)
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <X size={24} />
          </button>
          <h1 className="font-semibold text-gray-900">Create Post</h1>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading || !content.trim()}
          className="rounded-full px-6"
        >
          {uploading ? 'Uploading...' : 'Post'}
        </Button>
      </header>

      <div className="p-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center space-x-3 mb-6">
          <Avatar src={currentUser.avatar} fallback={currentUser.name} />
          <div>
            <p className="font-semibold text-gray-900">{currentUser.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                Public
              </span>
            </div>
          </div>
          <Button className="rounded-full bg-green-600 px-6 hover:bg-green-700">
            Publish
          </Button>
        </div>

            {/* Main Card */}
            <Card
              noPadding
              className="bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-3xl overflow-hidden"
            >
              {/* Pinterest-style image grid */}
              {images.length > 0 && (
                <div className="columns-2 md:columns-3 gap-2 p-2">
                  <AnimatePresence>
                    {images.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mb-2 relative group break-inside-avoid"
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-full rounded-xl object-cover"
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              
              <div className="p-5 space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What’s growing on your farm today? "
                  rows={4}
                  className="w-full resize-none rounded-2xl bg-white/10 border border-white/10 p-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              
                <div className="flex flex-wrap gap-2">
                  {["Advice", "Question", "Marketplace", "Success Story"].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                          tag === t
                            ? "bg-green-600 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        <Hash size={12} />
                        {t}
                      </button>
                    )
                  )}
                </div>

             
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

           
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Maize yield tips",
                "Organic farming",
                "Market prices",
                "Irrigation hacks",
              ].map((idea) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={idea}
                  className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-4"
                >
                  <Sprout className="mb-2 text-green-400" size={20} />
                  <p className="text-xs font-semibold text-white">
                    {idea}
                  </p>
                  <p className="mt-1 text-[11px] text-white/50">
                    Trending topic
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
=======
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
            placeholder="What’s growing on your farm today?"
            className="w-full bg-transparent resize-none p-4 text-sm focus:outline-none"
            rows={4}
          />

          {/* Image Previews (multiple) */}
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

          {/* Image Upload Input (multiple) */}
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
              {isSubmitting || imageUploading ? 'Posting…' : 'Publish'}
            </Button>
          </div>
        </Card>
      </Motion.div>
>>>>>>> 056910e (solve lint errors)
    </div>
  )
}

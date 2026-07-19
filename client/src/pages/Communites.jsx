import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, Plus, Users, X, Stethoscope } from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import ExpertCard from '../components/ExpertCard'
import { CropHelper } from './CropHelper'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('experts')
  const [experts, setExperts] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  useEffect(() => {
    if (activeTab === 'experts') {
      fetchExperts()
    } else if (activeTab === 'communities') {
      fetchCommunities()
    }
  }, [activeTab])

  const handleCreateCommunity = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setCreateError('Community name is required')
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await apiRequest(API_ENDPOINTS.communities.create, {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      })
      setShowCreate(false)
      setNewName('')
      setNewDescription('')
      fetchCommunities()
    } catch (err) {
      setCreateError(err.message || 'Failed to create community')
    } finally {
      setCreating(false)
    }
  }

  const fetchExperts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.users.experts)
      setExperts(response.experts || [])
    } catch (err) {
      setError(err.message || 'Failed to load experts')
      setExperts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRequest(API_ENDPOINTS.communities.list)
      setCommunities(response.communities || [])
    } catch (err) {
      setError(err.message || 'Failed to load communities')
      setCommunities([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-black/40 backdrop-blur-sm pb-24">
        {/* CONTENT WRAPPER */}
        <div className="w-full pt-6">
          {/* This is the magic container */}
          <div className="mx-auto px-4 lg:px-8 max-w-2xl lg:ml-[320px]">
            
            {/* HEADER */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">
                  Discover
                </h1>
                {activeTab === 'communities' && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={16} />
                    New Community
                  </button>
                )}
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  placeholder="Search experts, topics, or communities..."
                  className="w-full rounded-xl bg-white/10 backdrop-blur-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
            </div>

            {/* TABS */}
            <div className="flex bg-white/10 backdrop-blur-xl rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab('experts')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === 'experts'
                    ? 'bg-green-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Experts
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === 'communities'
                    ? 'bg-green-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Communities
              </button>

              <button
                onClick={() => setActiveTab('crop-helper')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'crop-helper'
                    ? 'bg-green-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Stethoscope size={14} />
                Crop Helper
              </button>
            </div>

            {/* CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {activeTab === 'crop-helper' ? (
                <div className="bg-white/95 dark:bg-slate-800/95 rounded-2xl p-4">
                  <CropHelper />
                </div>
              ) : loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : error ? (
                <p className="text-red-300 text-center py-6">{error}</p>
              ) : activeTab === 'experts' ? (
                experts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    id={expert.id}
                    name={expert.username}
                    specialty={expert.bio || expert.role || 'Member'}
                    followers={expert.followers_count ?? 0}
                    avatar={expert.profile_image_url}
                    glass
                  />
                ))
              ) : (
                communities.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-white/70 text-lg">
                      No communities yet
                    </p>
                    <p className="text-white/40 text-sm mt-2 max-w-sm mx-auto">
                      Communities will appear here when they are created.
                    </p>
                  </div>
                ) : (
                  communities.map((community) => (
                    <Link
                      to={`/communities/${community.id}`}
                      key={community.id}
                      className="block bg-white/10 backdrop-blur-xl rounded-xl p-4 text-white hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold">{community.name}</h3>
                        {community.is_member && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Joined
                          </span>
                        )}
                      </div>
                      {community.description && (
                        <p className="text-sm text-white/80 mt-1 line-clamp-2">{community.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-white/50 mt-2">
                        <Users size={14} />
                        {community.member_count ?? 0} member{community.member_count === 1 ? '' : 's'}
                      </div>
                    </Link>
                  ))
                )
              )}
            </motion.div>

          </div>
        </div>
      </div>

      {/* Create Community modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Community</h3>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setCreateError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {createError}
              </p>
            )}

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Community name"
                maxLength={120}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                autoFocus
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What's this community about? (optional)"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : null}
                {creating ? 'Creating...' : 'Create Community'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

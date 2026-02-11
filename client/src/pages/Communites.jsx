import React, { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import ExpertCard from '../components/ExpertCard'
import CommunityCard from '../components/CommunityCard'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function CommunitiesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('experts')
  const [experts, setExperts] = useState([])
  const [communities, setCommunities] = useState([])
  const [joinedCommunities, setJoinedCommunities] = useState(new Set())
  const [followingIds, setFollowingIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeTab === 'experts') {
      fetchExperts()
    } else {
      fetchCommunities()
    }
  }, [activeTab, user?.id])

  const fetchExperts = async () => {
    try {
      setLoading(true)
      setError(null)
<<<<<<< HEAD
      const response = await apiRequest(API_ENDPOINTS.users.experts)
      setExperts(response.experts || [])
=======
      const [expertsRes, followingRes] = await Promise.all([
        apiRequest(API_ENDPOINTS.users.experts),
        user?.id
          ? apiRequest(API_ENDPOINTS.users.following(user.id)).catch(() => [])
          : Promise.resolve([]),
      ])
      setExperts(expertsRes.experts || [])
      const ids = Array.isArray(followingRes)
        ? new Set(followingRes.map((f) => f.followed_id).filter(Boolean))
        : new Set()
      setFollowingIds(ids)
>>>>>>> 323936a (API integration)
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
<<<<<<< HEAD
      const response = await apiRequest(API_ENDPOINTS.communities.list)
      setCommunities(response.communities || [])
=======
      const res = await apiRequest(API_ENDPOINTS.communities.list)
      const communitiesList = res.communities || res.posts || []
      setCommunities(communitiesList)
      
      // Track which communities user has joined
      if (user) {
        const joined = new Set()
        for (const community of communitiesList) {
          // Check if user is a member (you may need to fetch members separately)
          // For now, we'll track join state locally
        }
        setJoinedCommunities(joined)
      }
>>>>>>> 323936a (API integration)
    } catch (err) {
      setError(err.message || 'Failed to load communities')
      setCommunities([])
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
=======
  const toggleCommunityJoin = async (communityId) => {
    if (!user) return
    
    const isJoined = joinedCommunities.has(communityId)
    
    try {
      if (isJoined) {
        await apiRequest(API_ENDPOINTS.communities.leave(communityId), {
          method: 'DELETE',
        })
        setJoinedCommunities((prev) => {
          const next = new Set(prev)
          next.delete(communityId)
          return next
        })
      } else {
        await apiRequest(API_ENDPOINTS.communities.join(communityId), {
          method: 'POST',
        })
        setJoinedCommunities((prev) => new Set(prev).add(communityId))
      }
    } catch (error) {
      console.error('Failed to toggle community join:', error)
    }
  }

  const query = searchQuery.toLowerCase()

  const filteredExperts = useMemo(
    () =>
      experts.filter(
        (e) =>
          e.username?.toLowerCase().includes(query) ||
          e.bio?.toLowerCase().includes(query) ||
          e.role?.toLowerCase().includes(query)
      ),
    [experts, query]
  )

  const filteredCommunities = useMemo(
    () =>
      communities.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      ),
    [communities, query]
  )

>>>>>>> 323936a (API integration)
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm pb-24 ml-20">
        <div className="w-full pt-10">
          <div className="mx-auto px-7 lg:px-8 max-w-2xl lg:ml-[320px]">
          
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-4 ml-60">
                Discover
              </h1>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${
                    activeTab === 'experts'
                      ? 'experts'
                      : 'communities'
                  }...`}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
            </div>

           
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
            </div>

          
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : error ? (
                <p className="text-red-300 text-center py-6">{error}</p>
              ) : activeTab === 'experts' ? (
<<<<<<< HEAD
                experts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    id={expert.id}
                    name={expert.username}
                    specialty={expert.bio || expert.role || 'Member'}
                    followers={expert.followers_count ?? 0}
                    avatar={expert.profile_image_url}
                    glass
=======
                filteredExperts.length ? (
                  filteredExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      id={expert.id}
                      name={expert.username}
                      specialty={expert.bio || expert.role || 'Member'}
                      followers={expert.followers_count ?? 0}
                      avatar={expert.profile_image_url}
                      glass
                      initiallyFollowing={followingIds.has(expert.id)}
                    />
                  ))
                ) : (
                  <p className="text-center text-white/60 text-sm">
                    No experts found
                  </p>
                )
              ) : filteredCommunities.length ? (
                filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    name={community.name}
                    category="Community"
                    members={community.members_count || 0}
                    description={community.description || ''}
                    avatar={community.image_url || 'https://via.placeholder.com/48'}
                    isFollowing={joinedCommunities.has(community.id)}
                    onToggleFollow={() => toggleCommunityJoin(community.id)}
>>>>>>> 323936a (API integration)
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
                    <div
                      key={community.id}
                      className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-white"
                    >
                      <h3 className="font-bold">{community.name}</h3>
                      {community.description && (
                        <p className="text-sm text-white/80 mt-1">{community.description}</p>
                      )}
                    </div>
                  ))
                )
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

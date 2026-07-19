import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, MessageSquare, Plus, Loader2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import PostCard from '../components/PostCard'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export function CommunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [communityData, postsData] = await Promise.all([
        apiRequest(API_ENDPOINTS.communities.byId(id)),
        apiRequest(API_ENDPOINTS.communities.posts(id)),
      ])
      setCommunity(communityData)
      setPosts(postsData.posts || [])
    } catch (err) {
      setError(err.message || 'Failed to load community')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  const toggleMembership = async () => {
    if (!community) return
    setJoining(true)
    try {
      if (community.is_member) {
        await apiRequest(API_ENDPOINTS.communities.leave(id), { method: 'DELETE' })
        setCommunity((prev) => ({
          ...prev,
          is_member: false,
          member_count: Math.max(0, (prev.member_count || 1) - 1),
        }))
      } else {
        await apiRequest(API_ENDPOINTS.communities.join(id), { method: 'POST' })
        setCommunity((prev) => ({
          ...prev,
          is_member: true,
          member_count: (prev.member_count || 0) + 1,
        }))
      }
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (error && !community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 px-4">
        <p className="text-red-500 text-center">{error}</p>
        <Link to="/communities" className="text-green-600 text-sm font-medium">
          Back to Communities
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/communities')} className="p-1 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{community?.name}</h1>
      </header>

      <div className="bg-white dark:bg-slate-800 px-4 py-5 mb-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <Avatar src={community?.image_url} fallback={community?.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{community?.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Users size={14} />
              {community?.member_count ?? 0} member{community?.member_count === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {community?.description && (
          <p className="text-sm text-gray-600 mt-4">{community.description}</p>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={community?.is_member ? 'outline' : 'primary'}
            size="sm"
            onClick={toggleMembership}
            isLoading={joining}
          >
            {community?.is_member ? 'Leave' : 'Join'}
          </Button>

          {community?.is_member && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/communities/${id}/chat`)}
              >
                <MessageSquare size={16} className="mr-1.5" />
                Group Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/create?community_id=${id}`)}
              >
                <Plus size={16} className="mr-1.5" />
                Post
              </Button>
            </>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      <div className="px-4">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No posts in this community yet.</p>
            {community?.is_member && (
              <p className="text-gray-400 text-sm mt-1">Be the first to share something.</p>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={{
                name: post.author?.username || 'User',
                avatar: post.author?.profile_image_url,
                role: post.author?.role === 'admin' ? 'Admin' : post.author?.role === 'expert' ? 'Expert' : 'Farmer',
              }}
              title={post.title || ''}
              description={post.content}
              image={post.image_url}
              likes={post.likes_count || 0}
              comments={post.comments_count || 0}
              timeAgo={post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
            />
          ))
        )}
      </div>
    </div>
  )
}

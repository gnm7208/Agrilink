import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Settings, MapPin, Calendar, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import PostCard from '../components/PostCard'
import { EditProfileModal } from '../components/EditProfileModal'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { userId: routeUserId } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const isViewingOther = routeUserId != null && String(currentUser?.id) !== String(routeUserId)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (isViewingOther) {
        const profileUser = await apiRequest(API_ENDPOINTS.users.byId(routeUserId))
        setUser(profileUser)
        const data = await apiRequest(API_ENDPOINTS.posts.mine(routeUserId))
        setPosts(Array.isArray(data?.posts) ? data.posts : [])
      } else {
        const me = await apiRequest(API_ENDPOINTS.auth.me)
        if (!me?.authenticated) throw new Error('Not authenticated')
        setUser(me.user)
        const userId = me?.user?.id
        if (userId) {
          const data = await apiRequest(API_ENDPOINTS.posts.mine(userId))
          setPosts(Array.isArray(data?.posts) ? data.posts : [])
        } else {
          setPosts([])
        }
      }
    } catch (err) {
      const message = err?.message || (isViewingOther ? 'User not found' : 'Failed to load profile')
      setError(message)
      if (isViewingOther && err?.status === 404) {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [routeUserId, isViewingOther])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      await apiRequest(API_ENDPOINTS.auth.resendVerification, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      setResendSent(true)
    } finally {
      setResendLoading(false)
    }
  }

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined'
    const date = new Date(dateString)
    return `Joined ${date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <p className="mb-4 text-center">{error}</p>
        <div className="flex gap-3">
          {isViewingOther ? (
            <Link to="/">
              <Button>Go to home</Button>
            </Link>
          ) : (
            <Button onClick={fetchProfile}>Try Again</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-xl">
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isViewingOther && (
              <Link to="/" className="p-2 -m-2 text-white/80 hover:text-white rounded-lg" aria-label="Go back">
                <ArrowLeft size={20} />
              </Link>
            )}
            <h1 className="font-bold text-lg text-white">
              {isViewingOther ? (user?.username ?? 'Profile') : 'My Profile'}
            </h1>
          </div>
          {!isViewingOther && <Settings className="text-white/80" />}
        </header>

        {!isViewingOther && user?.email_verified === false && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-500/10 backdrop-blur border border-amber-500/30">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <p className="text-sm text-amber-800 flex-1">
                Please verify your email to unlock full features.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleResendVerification}
                isLoading={resendLoading}
              >
                {resendSent ? 'Email Sent' : 'Resend Verification'}
              </Button>
            </div>
          </div>
        )}

        <div className="mx-4 mt-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/30 shadow-lg overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-green-600/90 to-green-500/90">
            <div className="absolute -bottom-12 left-6">
              <Avatar
                src={user?.profile_image_url}
                fallback={user?.username}
                size="xl"
                className="border-4 border-white shadow-md"
              />
            </div>
          </div>

          <div className="pt-16 px-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{user?.username ?? 'User'}</h2>
                {user?.role && (
                  <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>

              {!isViewingOther && (
                <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {user?.bio && (
              <p className="mt-3 text-sm text-white/80">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/70">
              {user?.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={15} />
                  {user.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={15} />
                {formatJoinDate(user?.created_at)}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 text-center border-t border-white/30 pt-4">
              <div>
                <p className="font-bold text-gray-900">
                  {user.posts_count || 0}
                </p>
                <p className="text-xs text-gray-600">Posts</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {user.followers_count || 0}
                </p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {user.following_count || 0}
                </p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mt-6 space-y-4">
          <h3 className="font-bold text-white text-lg">Recent Posts</h3>
          {!Array.isArray(posts) || posts.length === 0 ? (
            <p className="text-white/60 text-sm">No posts yet</p>
          ) : (
            posts.map((post) => {
              const normalized = {
                id: post.id,
                author: {
                  id: post.author?.id,
                  name: post.author?.username ?? 'User',
                  avatar: post.author?.profile_image_url,
                  role: post.author?.role,
                },
                title: post.title ?? '',
                description: post.content,
                image: post.image_url ?? post.images?.[0]?.image_url,
                likes: post.likes_count ?? 0,
                comments: post.comments_count ?? 0,
                timeAgo: post.created_at
                  ? new Date(post.created_at).toLocaleDateString()
                  : '',
              }
              return <PostCard key={post.id} {...normalized} />
            })
          )}
        </div>

        {showEditModal && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditModal(false)}
            onSave={(updated) => setUser(updated)}
          />
        )}
      </div>
    </div>
  )
}

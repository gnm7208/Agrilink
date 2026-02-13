import React, { useState, useEffect } from 'react'
import { Settings, MapPin, Calendar, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import PostCard from '../components/PostCard'
import { EditProfileModal } from '../components/EditProfileModal'
import { apiRequest, API_ENDPOINTS } from '../config/api'
export function ProfilePage() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  useEffect(() => {
    fetchProfile()
  }, [])
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const me = await apiRequest(API_ENDPOINTS.auth.me)
      if (!me?.authenticated) throw new Error('Not authenticated')
      setUser(me.user)
      const userPosts = await apiRequest(`${API_ENDPOINTS.posts.list}?author_id=${me.user.id}`)
      setPosts(userPosts.posts || [])
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }
  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <p className="mb-4">{error}</p>
        <Button onClick={fetchProfile}>Try Again</Button>
      </div>
    )
  }
return (
  <div
    className="min-h-screen pb-24 lg:ml-64"
    style={{
      backgroundImage:
        'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="min-h-screen bg-black/60 backdrop-blur-xl">
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg text-white">My Profile</h1>
        <Settings className="text-white/80" />
      </header>
        {user.email_verified === false && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-500/10 backdrop-blur border border-amber-500/30">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <p className="text-sm text-amber-200 flex-1">
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
        <div className="mx-4 mt-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-green-600/80 to-green-500/80">
            <div className="absolute -bottom-12 left-6">
              <Avatar
                src={user.profile_image_url}
                fallback={user.username}
                size="xl"
                className="border-4 border-black shadow-md"
              />
            </div>
          </div>
          <div className="pt-16 px-6 pb-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                {user.role && (
                  <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)}>
                Edit Profile
              </Button>
            </div>
            {user.bio && (
              <p className="mt-3 text-sm text-white/80">{user.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/70">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={15} />
                  {user.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={15} />
                {formatJoinDate(user.created_at)}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 mt-6 space-y-4">
          <h3 className="font-bold text-white text-lg">Recent Posts</h3>
          {posts.length === 0 ? (
            <p className="text-white/60 text-sm">No posts yet</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} {...post} />)
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

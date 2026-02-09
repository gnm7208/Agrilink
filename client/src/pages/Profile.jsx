import React, { useState, useEffect } from 'react'
import { Settings, MapPin, Calendar, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import PostCard from '../components/PostCard'
import { EditProfileModal } from '../components/EditProfileModal'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { posts as mockPosts } from '../data/mockData'

export function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(API_ENDPOINTS.auth.me)
      if (response?.authenticated && response.user) {
        setUser(response.user)
      } else {
        setError('Please log in to view your profile')
      }
    } catch (err) {
      setError(err?.message || 'Failed to load profile')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }


  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCurrentUser}>Try Again</Button>
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
      
      <div className="min-h-screen bg-white/70 backdrop-blur-md">
       
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-white/30 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900">My Profile</h1>
          <Settings className="text-gray-700" />
        </header>

        
        {user.email_verified === false && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-50/80 backdrop-blur border border-amber-200">
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
          {/* COVER */}
          <div className="relative h-32 bg-gradient-to-r from-green-600/90 to-green-500/90">
            <div className="absolute -bottom-12 left-6">
              <Avatar
                src={user.profile_image_url}
                fallback={user.username}
                size="xl"
                className="border-4 border-white shadow-md"
              />
            </div>
          </div>

          
          <div className="pt-16 px-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.username}
                </h2>
                {user.role && (
                  <span className="inline-block mt-1 text-xs font-medium bg-green-100/80 text-green-700 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </Button>
            </div>

            {user.bio && (
              <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                {user.bio}
              </p>
            )}

           
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
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

       
        <div className="px-4 mt-8 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">
            Recent Posts
          </h3>
          {mockPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
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

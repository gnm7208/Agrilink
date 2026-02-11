<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import PostCard from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { apiRequest, API_ENDPOINTS } from '../config/api';

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
=======
import React, { useState, useEffect } from 'react'
import { Settings, MapPin, Calendar, Loader2 } from 'lucide-react'
=======
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Settings, MapPin, Calendar, Loader2, ArrowLeft } from 'lucide-react'
>>>>>>> 323936a (API integration)
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import PostCard from '../components/PostCard'
import { EditProfileModal } from '../components/EditProfileModal'
import { apiRequest, API_ENDPOINTS } from '../config/api'
<<<<<<< HEAD
import { posts as mockPosts } from '../data/mockData'
=======
import { useAuth } from '../hooks/useAuth'
>>>>>>> 323936a (API integration)

export function ProfilePage() {
  const { userId: routeUserId } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
>>>>>>> 59187ef (initial commit)

<<<<<<< HEAD
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await apiRequest(
        `${API_ENDPOINTS.posts.list}?author_id=${user.id}&per_page=20`
      );
      const postsData = response.posts || [];
      setPosts(postsData.map((p) => ({
        id: p.id,
        author: p.author ? {
          name: p.author.username,
          avatar: p.author.profile_image_url,
          role: p.author.role || 'Farmer',
        } : { name: 'Unknown', avatar: null, role: 'User' },
        title: p.title || '',
        description: p.content,
        image: p.image_url || (p.images?.[0]?.image_url),
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        timeAgo: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
        tags: [],
      })));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

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
=======
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
>>>>>>> 323936a (API integration)
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
    const isNotFound = isViewingOther
    return (
<<<<<<< HEAD
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCurrentUser}>Try Again</Button>
=======
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <p className="mb-4 text-center">{error}</p>
        <div className="flex gap-3">
          {isNotFound ? (
            <Link to="/">
              <Button>Go to home</Button>
            </Link>
          ) : (
            <Button onClick={fetchProfile}>Try Again</Button>
          )}
        </div>
>>>>>>> 323936a (API integration)
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
<<<<<<< HEAD
      
      <div className="min-h-screen bg-white/70 backdrop-blur-md">
       
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-white/30 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900">My Profile</h1>
          <Settings className="text-gray-700" />
        </header>

        
        {user.email_verified === false && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-50/80 backdrop-blur border border-amber-200">
=======
      <div className="min-h-screen bg-black/60 backdrop-blur-xl">
        {/* Header */}
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

        {/* Verify email - only for own profile */}
        {!isViewingOther && user?.email_verified === false && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-500/10 backdrop-blur border border-amber-500/30">
>>>>>>> 323936a (API integration)
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
<<<<<<< HEAD
                <h2 className="text-xl font-bold text-gray-900">
                  {user.username}
                </h2>
                {user.role && (
                  <span className="inline-block mt-1 text-xs font-medium bg-green-100/80 text-green-700 px-2 py-0.5 rounded-full">
=======
                <h2 className="text-xl font-bold">{user?.username ?? 'User'}</h2>
                {user?.role && (
                  <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
>>>>>>> 323936a (API integration)
                    {user.role}
                  </span>
                )}
              </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> 323936a (API integration)
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

<<<<<<< HEAD
<<<<<<< HEAD
      {/* Recent Posts Section */}
      <div className="px-4 space-y-4">
        <h3 className="font-bold text-gray-900 text-lg">Recent Posts</h3>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 py-6">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))
        )}
      </div>
=======
       
        <div className="px-4 mt-8 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">
            Recent Posts
          </h3>
          {mockPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
=======
        {/* Posts */}
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
>>>>>>> 323936a (API integration)
        </div>
>>>>>>> 59187ef (initial commit)

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

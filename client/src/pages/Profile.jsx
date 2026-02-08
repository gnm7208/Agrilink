import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import PostCard from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { posts as mockPosts } from '../data/mockData'; // Fallback for posts

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.auth.me);

      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setError('Please log in to view your profile');
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSent(false);
    try {
      await apiRequest(API_ENDPOINTS.auth.resendVerification, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setResendSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">{error || 'Unable to load profile'}</p>
        <Button onClick={fetchCurrentUser}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">My Profile</h1>
        <button className="text-gray-600 hover:text-gray-900">
          <Settings size={24} />
        </button>
      </header>

      {user && user.email_verified === false && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-amber-800 flex-1">
            Please verify your email to get full access.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleResendVerification}
            isLoading={resendLoading}
            disabled={resendLoading}
          >
            {resendSent ? 'Sent — check your email' : 'Resend verification email'}
          </Button>
        </div>
      )}

      <div className="bg-white pb-6 mb-4">
        {/* Cover / Banner */}
        <div className="relative h-32 bg-green-600">
          <div className="absolute -bottom-12 left-4 p-1 bg-white rounded-full">
            <Avatar
              src={user.profile_image_url}
              fallback={user.username}
              size="xl"
            />
          </div>
        </div>

        <div className="pt-14 px-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h2>
              {user.role && (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                  {user.role}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </Button>
          </div>

          {user.bio && (
            <p className="text-gray-600 mb-4 leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            {user.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>{formatJoinDate(user.created_at)}</span>
            </div>
          </div>

          {/* Stats - Using placeholder values until API provides them */}
          <div className="flex items-center space-x-8 border-t border-gray-100 pt-4">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {user.posts_count || 0}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {user.followers_count || 0}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {user.following_count || 0}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="px-4 space-y-4">
        <h3 className="font-bold text-gray-900 text-lg">Recent Posts</h3>
        {/* TODO: Fetch user's posts from API */}
        {mockPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}

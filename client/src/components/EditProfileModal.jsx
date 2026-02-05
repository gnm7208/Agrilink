import React, { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { useImageUpload } from '../hooks/useImageUpload';

/**
 * Edit Profile Modal Component
 * Allows users to update their bio, location, and profile image
 */
export function EditProfileModal({ user, onClose, onSave }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    preview: avatarPreview,
    uploading: avatarUploading,
    error: avatarError,
    selectAndUpload,
    uploadedUrl: newAvatarUrl,
  } = useImageUpload();

  // Current avatar: new uploaded, preview, or existing
  const displayAvatar = newAvatarUrl || avatarPreview || user?.profile_image_url;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await selectAndUpload(file);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        bio: bio.trim(),
        location: location.trim(),
      };

      // Include new avatar URL if uploaded
      if (newAvatarUrl) {
        updateData.profile_image_url = newAvatarUrl;
      }

      const updatedUser = await apiRequest(API_ENDPOINTS.users.byId(user.id), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      onSave?.(updatedUser);
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayError = error || avatarError;
  const isLoading = saving || avatarUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
            <h2 className="font-semibold text-gray-900">Edit Profile</h2>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            disabled={isLoading}
            className="rounded-full px-6"
          >
            Save
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Error Display */}
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {displayError}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                src={displayAvatar}
                fallback={user?.username}
                size="xl"
                className="w-24 h-24"
              />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Tap to change photo</p>
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you based?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { useImageUpload } from '../hooks/useImageUpload';
import { useAuth } from '../hooks/useAuth';

export function CreatePost() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const {
    preview,
    uploading,
    error: uploadError,
    hasFile,
    handleFileSelect,
    clearFile,
    upload,
  } = useImageUpload();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate content
    if (!content.trim()) {
      setSubmitError('Please write some content for your post');
      return;
    }

    if (content.trim().length < 10) {
      setSubmitError('Content must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload image if selected
      let imageUrl = null;
      if (hasFile) {
        imageUrl = await upload();
      }

      // Step 2: Create the post (with image_url if uploaded)
      const postData = {
        title: title.trim() || undefined,
        content: content.trim(),
        image_url: imageUrl || undefined,
      };

      await apiRequest(API_ENDPOINTS.posts.create, {
        method: 'POST',
        body: JSON.stringify(postData),
      });

      // Success - navigate to home
      navigate('/');
    } catch (err) {
      console.error('Failed to create post:', err);
      setSubmitError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = submitError || uploadError;
  const isLoading = isSubmitting || uploading;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
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
          <Avatar src={user.profile_image_url} fallback={user.username} />
          <div>
            <p className="font-semibold text-gray-900">{user.username}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                Public
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title..."
            className="w-full text-xl font-bold placeholder-gray-400 border-none focus:ring-0 p-0 focus:outline-none"
            maxLength={255}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your farming experience or ask a question..."
            className="w-full min-h-[200px] text-base text-gray-700 placeholder-gray-400 border-none focus:ring-0 p-0 resize-none focus:outline-none"
            maxLength={10000}
          />

          {/* Image Preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden mb-4 group">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-auto max-h-80 object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={clearFile}
                disabled={uploading}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-4 max-w-md mx-auto">
          <label className="p-3 text-green-600 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <ImageIcon size={24} />
          </label>
          <label className="p-3 text-green-600 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Camera size={24} />
          </label>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Camera, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { currentUser } from '../data/mockData';

export function CreatePost() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
  };

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
          isLoading={isSubmitting}
          className="rounded-full px-6"
        >
          Post
        </Button>
      </header>

      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar src={currentUser.avatar} fallback={currentUser.name} />
          <div>
            <p className="font-semibold text-gray-900">{currentUser.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                Public
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Give your post a title..."
            className="w-full text-xl font-bold placeholder-gray-400 border-none focus:ring-0 p-0"
          />

          <textarea
            placeholder="Share your farming experience or ask a question..."
            className="w-full min-h-[200px] text-base text-gray-700 placeholder-gray-400 border-none focus:ring-0 p-0 resize-none"
          />

          {image && (
            <div className="relative rounded-2xl overflow-hidden mb-4 group">
              <img
                src={image}
                alt="Upload preview"
                className="w-full h-auto max-h-80 object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-4 max-w-md mx-auto">
          <label className="p-3 text-green-600 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ImageIcon size={24} />
          </label>
          <button className="p-3 text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <Camera size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

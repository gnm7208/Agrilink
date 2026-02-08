import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { useImageUpload } from '../hooks/useImageUpload';
import { currentUser } from '../data/mockData'; // TODO: Replace with auth context

export function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const addImage = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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
          <Avatar src={currentUser.avatar} fallback={currentUser.name} />
          <div>
            <p className="font-semibold text-gray-900">{currentUser.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                Public
              </span>
            </div>
          </div>
          <Button className="rounded-full bg-green-600 px-6 hover:bg-green-700">
            Publish
          </Button>
        </div>

       
        <Card className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <CardContent className="p-0">
           
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-1 bg-gray-100 md:grid-cols-3">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="space-y-4 p-5">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What’s growing on your farm today? 🌱"
                className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm focus:border-green-500 focus:outline-none"
                rows={4}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {["Advice", "Question", "Marketplace", "Success Story"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      tag === t
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <ImagePlus size={14} />
                    Images
                    <input type="file" multiple hidden onChange={addImage} />
                  </label>
                  <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <Camera size={14} />
                    Camera
                  </button>
                  <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <MapPin size={14} />
                    Location
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs text-green-700">
                  <Leaf size={14} />
                  Agrilink verified content
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspiration strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["Maize tips", "Organic farming", "Market prices", "Irrigation"].map((idea) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={idea}
              className="rounded-xl bg-white p-4 shadow-md"
            >
              <Sprout className="mb-2 text-green-600" size={20} />
              <p className="text-xs font-semibold text-gray-700">{idea}</p>
              <p className="mt-1 text-[11px] text-gray-500">Trending topic</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

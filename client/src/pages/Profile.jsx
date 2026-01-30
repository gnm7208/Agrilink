import React from 'react';
import { Settings, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import  PostCard  from '../components/PostCard';
import { currentUser, posts } from '../data/mockData';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">My Profile</h1>
        <button className="text-gray-600 hover:text-gray-900">
          <Settings size={24} />
        </button>
      </header>

      <div className="bg-white pb-6 mb-4">
        <div className="relative h-32 bg-green-600">
          <div className="absolute -bottom-12 left-4 p-1 bg-white rounded-full">
            <Avatar
              src={currentUser.avatar}
              fallback={currentUser.name}
              size="xl"
            />
          </div>
        </div>

        <div className="pt-14 px-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentUser.name}
              </h2>
              <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                {currentUser.role}
              </span>
            </div>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {currentUser.bio}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1" />
              <span>California, USA</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>Joined Jan 2023</span>
            </div>
          </div>

          <div className="flex items-center space-x-8 border-t border-gray-100 pt-4">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {currentUser.posts}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {currentUser.followers}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {currentUser.following}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <h3 className="font-bold text-gray-900 text-lg">Recent Posts</h3>
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}

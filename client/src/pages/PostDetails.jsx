import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Heart, Share2, MessageCircle } from 'lucide-react'
import { posts, comments } from '../data/mockData'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import  CommentItem  from '../components/Commentitem'

export function PostDetails() {
  const { id } = useParams()

  
  const post =
    posts.find((p) => String(p.id) === String(id)) || posts[0]

  const [newComment, setNewComment] = useState('')

  return (
    <div className="bg-white min-h-screen pb-20">
  
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-semibold text-gray-900">Post Details</h1>
      </header>

      
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar src={post.author.avatar} fallback={post.author.name} />
          <div>
            <h3 className="font-bold text-gray-900">
              {post.author.name}
            </h3>
            <span className="text-xs text-gray-500">
              {post.timeAgo} • {post.author.role}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {post.title}
        </h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          {post.description}
        </p>

        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

  
        <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
          <div className="flex space-x-6">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
              <Heart size={22} />
              <span>{post.likes}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
              <MessageCircle size={22} />
              <span>{post.comments}</span>
            </button>
          </div>

          <button className="text-gray-500 hover:text-green-600">
            <Share2 size={22} />
          </button>
        </div>

       
        <div className="space-y-6">
          <h3 className="font-bold text-gray-900">Comments</h3>

          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </div>
        </div>
      </div>

     
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-3 max-w-md mx-auto">
          <Avatar fallback="ME" size="sm" />

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Card } from './ui/Card'
import { Avatar } from './ui/Avatar'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PostCard = ({
  id,
  author,
  title,
  description,
  image,
  likes,
  comments,
  timeAgo,
  tags,
}) => {
  return (
    <Card noPadding className="mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar src={author.avatar} fallback={author.name} />

            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {author.name}
              </h3>

              <div className="flex items-center text-xs text-gray-500">
                <span
                  className={`mr-2 px-1.5 py-0.5 rounded-full ${
                    author.role === 'Expert'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {author.role}
                </span>
                <span>• {timeAgo}</span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <Link to={`/post/${id}`} className="block group">
          <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
            {title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
            {description}
          </p>
        </Link>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {image && (
        <Link
          to={`/post/${id}`}
          className="block aspect-video w-full overflow-hidden bg-gray-100"
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </Link>
      )}

      <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
            <Heart
              size={20}
              className="group-hover:fill-red-500 group-active:scale-90 transition-transform"
            />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <Link
            to={`/post/${id}`}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{comments}</span>
          </Link>
        </div>

        <button className="text-gray-400 hover:text-green-600 transition-colors">
          <Share2 size={20} />
        </button>
      </div>
    </Card>
  )
}

export default PostCard
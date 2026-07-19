import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from 'lucide-react'
import { Card } from './ui/Card'
import { Avatar } from './ui/Avatar'
import { ReportModal } from './ReportModal'
import { Link } from 'react-router-dom'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'

const isNumericId = (val) => /^\d+$/.test(String(val))

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
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const canReport = isNumericId(id)

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

          {canReport && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                aria-label="Post options"
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setShowReport(true)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <Flag size={14} className="text-red-500" />
                      Report post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={Number(id)}
          onClose={() => setShowReport(false)}
        />
      )}
    </Card>
  )
}

export default PostCard
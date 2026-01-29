import React from 'react'
import { Avatar } from './ui/Avatar'

const CommentItem = ({ author, avatar, text, timeAgo }) => {
  return (
    <div className="flex space-x-3 py-4 border-b border-gray-50 last:border-0">
      <Avatar
        src={avatar}
        fallback={author}
        size="sm"
        className="flex-shrink-0"
      />

      <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {author}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default CommentItem
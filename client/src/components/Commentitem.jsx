import React, { useState } from 'react'
import { Flag } from 'lucide-react'
import { Avatar } from './ui/Avatar'
import { ReportModal } from './ReportModal'

const CommentItem = ({ id, author, avatar, text, timeAgo, onReported }) => {
  const [showReport, setShowReport] = useState(false)

  return (
    <div className="flex space-x-3 py-4 border-b border-gray-50 last:border-0">
      <Avatar
        src={avatar}
        fallback={author}
        size="sm"
        className="flex-shrink-0"
      />

      <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 group">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {author}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {id && (
              <button
                onClick={() => setShowReport(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                title="Report comment"
              >
                <Flag size={12} />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>

      {showReport && (
        <ReportModal
          targetType="comment"
          targetId={id}
          onClose={() => setShowReport(false)}
          onSubmitted={onReported}
        />
      )}
    </div>
  )
}

export default CommentItem
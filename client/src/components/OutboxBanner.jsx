import React from 'react'
import { CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { useOutbox } from '../hooks/useOutbox'

export function OutboxBanner() {
  const { pendingPosts, flush, flushing } = useOutbox()

  if (pendingPosts.length === 0) return null

  return (
    <div className="sticky top-0 z-40 bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <CloudOff size={16} />
        <span>
          {pendingPosts.length} post{pendingPosts.length === 1 ? '' : 's'} waiting to send
        </span>
      </div>
      <button
        onClick={flush}
        disabled={flushing}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
      >
        {flushing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        {flushing ? 'Sending...' : 'Retry now'}
      </button>
    </div>
  )
}

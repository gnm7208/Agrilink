import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { OutboxContext } from './outboxContext'
import { apiRequest, API_ENDPOINTS } from '../config/api'

const OUTBOX_KEY = 'agrilink_outbox'

function readOutbox() {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeOutbox(items) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items))
}

/**
 * App-wide local outbox for posts composed while offline (or when the
 * create-post request fails with a network error). Queues to localStorage
 * and retries on reconnect. A Context (not a plain hook) so CreatePost,
 * which lives under FullScreenLayout, and OutboxBanner, which lives under
 * MainLayout, share one live queue instead of drifting out of sync.
 * Intentionally scoped to post creation only, not every mutation.
 */
export function OutboxProvider({ children }) {
  const [pending, setPending] = useState(readOutbox)
  const [flushing, setFlushing] = useState(false)
  const queryClient = useQueryClient()
  const flushingRef = useRef(false)

  const queuePost = useCallback((postData) => {
    const entry = {
      localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      postData,
      queuedAt: Date.now(),
    }
    setPending((prev) => {
      const next = [...prev, entry]
      writeOutbox(next)
      return next
    })
    return entry.localId
  }, [])

  const removePending = useCallback((localId) => {
    setPending((prev) => {
      const next = prev.filter((e) => e.localId !== localId)
      writeOutbox(next)
      return next
    })
  }, [])

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    flushingRef.current = true
    setFlushing(true)
    try {
      const queued = readOutbox()
      let anySucceeded = false
      for (const entry of queued) {
        try {
          await apiRequest(API_ENDPOINTS.posts.create, {
            method: 'POST',
            body: JSON.stringify(entry.postData),
          })
          removePending(entry.localId)
          anySucceeded = true
        } catch {
          // Still offline or the server rejected it — leave it queued and
          // stop, preserving order rather than retrying out of sequence.
          break
        }
      }
      if (anySucceeded) {
        queryClient.invalidateQueries({ queryKey: ['feed'] })
      }
    } finally {
      flushingRef.current = false
      setFlushing(false)
    }
  }, [queryClient, removePending])

  useEffect(() => {
    if (navigator.onLine && readOutbox().length > 0) {
      flush()
    }
    const onOnline = () => flush()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <OutboxContext.Provider value={{ pendingPosts: pending, queuePost, removePending, flush, flushing }}>
      {children}
    </OutboxContext.Provider>
  )
}

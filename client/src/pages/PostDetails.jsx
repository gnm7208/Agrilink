import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Heart, Share2, MessageCircle, Loader2 } from 'lucide-react'
import CommentItem from '../components/Commentitem'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

const isNumericId = (str) => /^\d+$/.test(str)

export function PostDetails() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentsError, setCommentsError] = useState(null)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [isUserPost, setIsUserPost] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!isNumericId(id)) return
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const commentsRes = await apiRequest(API_ENDPOINTS.posts.comments(id))
      setComments(
        (commentsRes?.comments || []).map((c) => ({
          id: c.id,
          author: c.author?.username || 'Unknown',
          avatar: c.author?.profile_image_url,
          text: c.content,
          timeAgo: c.created_at
            ? new Date(c.created_at).toLocaleDateString()
            : '',
        }))
      )
    } catch (err) {
      setComments([])
      setCommentsError(err?.message || 'Could not load comments')
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setCommentsError(null)

      if (isNumericId(id)) {
        const postData = await apiRequest(API_ENDPOINTS.posts.byId(id))
        setIsUserPost(true)

        const imageList = postData.images?.length
          ? postData.images.map((img) => img.image_url)
          : postData.image_url
            ? [postData.image_url]
            : []
        setPost({
          id: postData.id,
          title: postData.title || '',
          description: postData.content,
          author: postData.author?.username,
          authorId: postData.author?.id,
          publishedAt: postData.created_at,
          image: postData.image_url,
          urlToImage: postData.image_url,
          images: imageList,
          likes_count: postData.likes_count,
          comments_count: postData.comments_count,
          liked: postData.liked || false,
        })

        setComments([])
        fetchComments()
      } else {
        const newsData = await apiRequest(
          API_ENDPOINTS.posts.newsById(id)
        )
        setIsUserPost(false)

        setPost({
          ...newsData,
          description: newsData.description,
          image: newsData.image,
          urlToImage: newsData.image,
          likes_count: 0,
          comments_count: 0,
        })

        setComments([])
      }
    } catch (err) {
      setError(err?.message || 'Post not found')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [id, fetchComments])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !isUserPost || !currentUser) return

    try {
      const res = await apiRequest(
        API_ENDPOINTS.posts.comments(id),
        {
          method: 'POST',
          body: JSON.stringify({ content: newComment.trim() }),
        }
      )

      setComments((prev) => [
        {
          id: res.id,
          author: currentUser.username,
          avatar: currentUser.profile_image_url,
          text: res.content,
          timeAgo: 'Just now',
        },
        ...prev,
      ])

      setNewComment('')
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
        <p className="text-gray-500 text-sm">Loading post…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-red-600 text-center mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setError(null); fetchPost(); }}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
          >
            Retry
          </button>
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            Go back
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link to="/" className="text-green-600 font-medium hover:underline">
          Go to home
        </Link>
      </div>
    )
  }

  const displayTitle =
    post.title?.trim() ||
    (post.description ? post.description.slice(0, 60).trim() + (post.description.length > 60 ? '…' : '') : '') ||
    'Post'
  const hasCommentBar = isUserPost && currentUser

  return (
    <div className={`bg-white min-h-screen ${hasCommentBar ? 'pb-24' : 'pb-8'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="p-2 -m-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-semibold text-gray-900">
          Post Details
        </h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {displayTitle}
        </h1>

        <p className="text-gray-500 text-sm mb-4">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : ''}
          {post.author
            ? post.authorId
              ? (
                  <>
                    {' • '}
                    <Link to={`/profile/${post.authorId}`} className="text-green-600 hover:underline">
                      {post.author}
                    </Link>
                  </>
                )
              : ` • ${post.author}`
            : ''}
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          {post.description || 'No description available.'}
        </p>

        {((post.images && post.images.length > 0) || post.urlToImage) && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-sm space-y-3">
            {(post.images && post.images.length > 0 ? post.images : [post.urlToImage]).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={displayTitle ? `${displayTitle} ${i + 1}` : `Image ${i + 1}`}
                className="w-full max-h-96 object-cover bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
          <div className="flex space-x-6">
            <button
              onClick={async () => {
                if (!isUserPost || !currentUser) return;
                const wasLiked = post.liked || false;
                const newLiked = !wasLiked;
                const newLikesCount = wasLiked
                  ? (post.likes_count || 0) - 1
                  : (post.likes_count || 0) + 1;

                // Optimistic update
                setPost((prev) => ({
                  ...prev,
                  liked: newLiked,
                  likes_count: newLikesCount,
                }));

                try {
                  if (wasLiked) {
                    await apiRequest(API_ENDPOINTS.posts.like(id), {
                      method: "DELETE",
                    });
                  } else {
                    await apiRequest(API_ENDPOINTS.posts.like(id), {
                      method: "POST",
                    });
                  }
                } catch (error) {
                  // Revert on error
                  setPost((prev) => ({
                    ...prev,
                    liked: wasLiked,
                    likes_count: post.likes_count || 0,
                  }));
                  console.error("Failed to toggle like:", error);
                }
              }}
              className={`flex items-center space-x-2 transition ${
                post.liked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart size={22} fill={post.liked ? "currentColor" : "none"} />
              <span>{post.likes_count ?? 0}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
              <MessageCircle size={22} />
              <span>{comments.length}</span>
            </button>
          </div>

          <button className="text-gray-500 hover:text-green-600">
            <Share2 size={22} />
          </button>
        </div>

        {/* Comments */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-gray-900 text-lg">Comments</h3>

          {commentsError && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-amber-800 text-sm flex-1">{commentsError}</p>
              <button
                type="button"
                onClick={fetchComments}
                disabled={commentsLoading}
                className="text-sm font-medium text-amber-700 hover:text-amber-900 underline disabled:opacity-50"
              >
                {commentsLoading ? 'Loading…' : 'Retry'}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {!commentsError && commentsLoading && comments.length === 0 && (
              <p className="text-gray-500 text-sm">Loading comments…</p>
            )}
            {!commentsError && !commentsLoading && comments.length === 0 && (
              <p className="text-gray-500">
                No comments yet.
              </p>
            )}

            {comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      {isUserPost && currentUser && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center space-x-3 max-w-md mx-auto"
          >
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

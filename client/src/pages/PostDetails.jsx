import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Heart, Share2, MessageCircle } from "lucide-react";
import CommentItem from "../components/Commentitem";
import { apiRequest, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../hooks/useAuth";

const isNumericId = (str) => /^\d+$/.test(str);

export function PostDetails() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserPost, setIsUserPost] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isNumericId(id)) {
        const postData = await apiRequest(API_ENDPOINTS.posts.byId(id));
        setIsUserPost(true);
        setPost({
          id: postData.id,
          title: postData.title || "",
          description: postData.content,
          author: postData.author?.username,
          publishedAt: postData.created_at,
          image: postData.image_url,
          urlToImage: postData.image_url,
          likes_count: postData.likes_count,
          comments_count: postData.comments_count,
        });

        const commentsRes = await apiRequest(API_ENDPOINTS.posts.comments(id));
        setComments(
          (commentsRes.comments || []).map((c) => ({
            id: c.id,
            author: c.author?.username || "Unknown",
            avatar: c.author?.profile_image_url,
            text: c.content,
            timeAgo: c.created_at
              ? new Date(c.created_at).toLocaleDateString()
              : "",
          }))
        );
      } else {
        const newsData = await apiRequest(API_ENDPOINTS.posts.newsById(id));
        setIsUserPost(false);
        setPost({
          ...newsData,
          description: newsData.description,
          image: newsData.image,
          urlToImage: newsData.image,
          likes_count: 0,
          comments_count: 0,
        });
        setComments([]);
      }
    } catch (err) {
      setError(err.message || "Post not found");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isUserPost || !currentUser) return;

    try {
      const res = await apiRequest(API_ENDPOINTS.posts.comments(id), {
        method: "POST",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      setComments((prev) => [
        {
          id: res.id,
          author: currentUser.username,
          avatar: currentUser.profile_image_url,
          text: res.content,
          timeAgo: "Just now",
        },
        ...prev,
      ]);

      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading post…</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!post) return <p className="text-center mt-10 text-gray-500">Post not found.</p>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-semibold text-gray-900">Post Details</h1>
      </header>

      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-2">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}{" "}
          {post.author ? `• ${post.author}` : ""}
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          {post.description || "No description available."}
        </p>

        {post.urlToImage && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
            <img src={post.urlToImage} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
          <div className="flex space-x-6">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
              <Heart size={22} />
              <span>{Math.floor(Math.random() * 100)}</span>
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

        <div className="space-y-6">
          <h3 className="font-bold text-gray-900">Comments</h3>

          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-gray-500">No comments yet.</p>
            )}
            {comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </div>
        </div>
      </div>

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
  );
}

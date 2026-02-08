import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Heart, Share2, MessageCircle } from "lucide-react";
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from "framer-motion";
import CommentItem from "../components/Commentitem";

export function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

       
        const res = await fetch(
          "http://localhost:5000/api/posts/news?page=1&page_size=20"
        );
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();

        
        const articles = Array.isArray(data.articles) ? data.articles : [];

       
        const foundPost = articles
          .map((article, index) => ({
            ...article,
            id: `${article.publishedAt}-${index}`,
          }))
          .find((p) => p.id === id);

        if (!foundPost) throw new Error("Post not found");
        setPost(foundPost);

      
        setComments([
          { id: 1, author: "John Doe", content: "Great article!" },
          { id: 2, author: "Jane Smith", content: "Very informative." },
        ]);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newC = { id: Date.now(), author: "ME", content: newComment };
    setComments((prev) => [newC, ...prev]);
    setNewComment("");

 
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading post…</p>;
  if (error)
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!post)
    return <p className="text-center mt-10 text-gray-500">Post not found.</p>;

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
          {new Date(post.publishedAt).toLocaleDateString()} • {post.source?.name}
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
            {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
            {comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </div>
        </div>
      </div>

      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-3 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!newComment.trim()}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

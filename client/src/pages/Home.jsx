import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Bell,
  Search,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Bell,
  Search,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

export function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState("");

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchPosts();
  }, [page]);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/posts/news?page=${page}&page_size=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();

      const formatted = data.articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        image: article.image,
        author: article.author,
        timeAgo: new Date(article.publishedAt).toLocaleDateString(),
        likes: Math.floor(Math.random() * 100),
        comments: [],
        liked: false,
        saved: false,
      }));

      setPosts((prev) => [...prev, ...formatted]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError("Unable to load articles");
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const addComment = (id) => {
    if (!commentText.trim()) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, commentText] }
          : post
      )
    );
    setCommentText("");
  };

  const toggleSave = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const sharePost = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    alert("Post link copied!");
  };

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState("");

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchPosts();
  }, [page]);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/posts/news?page=${page}&page_size=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();

      const formatted = data.articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        image: article.image,
        author: article.author,
        timeAgo: new Date(article.publishedAt).toLocaleDateString(),
        likes: Math.floor(Math.random() * 100),
        comments: [],
        liked: false,
        saved: false,
      }));

      setPosts((prev) => [...prev, ...formatted]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError("Unable to load articles");
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const addComment = (id) => {
    if (!commentText.trim()) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, commentText] }
          : post
      )
    );
    setCommentText("");
  };

  const toggleSave = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const sharePost = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    alert("Post link copied!");
  };

  return (
    <div
      className="min-h-screen  bg-cover bg-center lg:ml-64 "
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)",
      }}
    >
      <div className="min-h-screen w-full bg-black/30 backdrop-blur-sm">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md">
          <div className="flex justify-between items-center px-6 py-3">
            <h1 className="text-2xl font-bold text-green-200">Agrilink</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Search size={16} className="text-gray-300 mr-2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-white placeholder-white/70 w-40 text-sm"
                />
              </div>
              <button>
                <Bell size={20} className="text-white hover:text-green-200" />
              </button>
            </div>
          </div>
        </header>
    <div
      className="min-h-screen  bg-cover bg-center lg:ml-64 "
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)",
      }}
    >
      <div className="min-h-screen w-full bg-black/30 backdrop-blur-sm">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md">
          <div className="flex justify-between items-center px-6 py-3">
            <h1 className="text-2xl font-bold text-green-200">Agrilink</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Search size={16} className="text-gray-300 mr-2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-white placeholder-white/70 w-40 text-sm"
                />
              </div>
              <button>
                <Bell size={20} className="text-white hover:text-green-200" />
              </button>
            </div>
          </div>
        </header>

        {/* POSTS */}
        <main className="max-w-6xl mx-auto px-6 py-6 space-y-6 overflow-x-hidden">
          {filteredPosts.map((post) => (
        {/* POSTS */}
        <main className="max-w-6xl mx-auto px-6 py-6 space-y-6 overflow-x-hidden">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-lg text-white"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <p className="text-sm text-white/80">{post.description}</p>

                <div className="flex justify-between text-sm text-white/70">
                  <span>{post.author}</span>
                  <span>{post.timeAgo}</span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-6 pt-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart
                      size={18}
                      className={
                        post.liked
                          ? "fill-red-500 text-red-500"
                          : "text-white/70"
                      }
                    />
                    {post.likes}
                  </button>

                  <button
                    onClick={() => setActivePost(post.id)}
                    className="flex items-center gap-1 text-white/70"
                  >
                    <MessageCircle size={18} />
                    {post.comments.length}
                  </button>

                  <button
                    onClick={() => toggleSave(post.id)}
                    className={
                      post.saved ? "text-yellow-400" : "text-white/70"
                    }
                  >
                    <Bookmark size={18} />
                  </button>

                  <button
                    onClick={() => sharePost(post.id)}
                    className="text-white/70"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* COMMENT */}
                {activePost === post.id && (
                  <div className="flex gap-2 pt-3">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-full px-4 py-1 text-sm text-black"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="bg-green-600 px-4 rounded-full"
                    >
                      <Send size={16} color="white" />
                    </button>
                  </div>
                )}
              </div>
              className="bg-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-lg text-white"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <p className="text-sm text-white/80">{post.description}</p>

                <div className="flex justify-between text-sm text-white/70">
                  <span>{post.author}</span>
                  <span>{post.timeAgo}</span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-6 pt-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart
                      size={18}
                      className={
                        post.liked
                          ? "fill-red-500 text-red-500"
                          : "text-white/70"
                      }
                    />
                    {post.likes}
                  </button>

                  <button
                    onClick={() => setActivePost(post.id)}
                    className="flex items-center gap-1 text-white/70"
                  >
                    <MessageCircle size={18} />
                    {post.comments.length}
                  </button>

                  <button
                    onClick={() => toggleSave(post.id)}
                    className={
                      post.saved ? "text-yellow-400" : "text-white/70"
                    }
                  >
                    <Bookmark size={18} />
                  </button>

                  <button
                    onClick={() => sharePost(post.id)}
                    className="text-white/70"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* COMMENT */}
                {activePost === post.id && (
                  <div className="flex gap-2 pt-3">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-full px-4 py-1 text-sm text-black"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="bg-green-600 px-4 rounded-full"
                    >
                      <Send size={16} color="white" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <p className="text-center text-white">Loading…</p>
          )}

          {!loading && hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full py-3 bg-green-700 hover:bg-green-800 rounded-xl text-white font-medium"
            >
              Load More
            </button>
          )}

          {!hasMore && !loading && (
            <p className="text-center text-white/70 py-4">
              No more articles
            </p>
          )}

          {error && (
            <p className="text-center text-red-500 py-4">{error}</p>
          )}
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('http://localhost:5000/api/posts/news'); 
        const data = await res.json();

        
        const formattedPosts = data.map((article, index) => ({
          id: index,
          title: article.title,
          description: article.description,
          image: article.urlToImage,
          author: article.source.name,
          timeAgo: new Date(article.publishedAt).toLocaleDateString(),
          likes: Math.floor(Math.random() * 100), 
          comments: Math.floor(Math.random() * 20), 
        }));

        setPosts(formattedPosts);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading articles...</p>;

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">Agrilink</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-900">
            <Search size={24} />
          </button>
          <button className="text-gray-500 hover:text-gray-900 relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard {...post} />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

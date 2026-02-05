import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function HomeFeed() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)


  const navigate = useNavigate()
  const PAGE_SIZE = 20

  useEffect(() => {
    fetchArticles()
  }, [page])

  async function fetchArticles() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `http://localhost:5000/api/posts/news?page=${page}&page_size=${PAGE_SIZE}`
      )

      if (!res.ok) throw new Error("Failed to fetch articles")

      const data = await res.json()

      const formatted = data.articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        image: article.image,
        author: article.author,
        timeAgo: new Date(article.publishedAt).toLocaleDateString(),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20)
      }))

      setPosts(prev => [...prev, ...formatted])
      setHasMore(data.hasMore)
    } catch (err) {
      setError("Unable to load articles")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between">
        <h1 className="text-xl font-bold text-green-700">Agrilink</h1>
        <div className="flex gap-4">
          <Search />
          <Bell />
        </div>
      </header>
      <main className="p-4 space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PostCard
              {...post}
              onTitleClick={() =>
                navigate(`/post/${post.id}`, { state: { article: post } })
              }
            />
          </motion.div>
        ))}
        {loading && <p className="text-center text-gray-500">Loading…</p>}
        {!loading && hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-2 bg-green-700 text-white rounded"
          >
            Load More
          </button>
        )}

        {!hasMore && (
          <p className="text-center text-gray-400">No more articles</p>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}
      </main>
    </div>
  )
}

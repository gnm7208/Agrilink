import { useInfiniteQuery } from '@tanstack/react-query'
import { apiRequest, API_ENDPOINTS } from '../config/api'

const PAGE_SIZE = 20

/** Fetch one page of the merged feed (user posts + agricultural news). */
async function fetchFeedPage({ pageParam = 1 }) {
  const [newsData, postsData] = await Promise.allSettled([
    apiRequest(`${API_ENDPOINTS.posts.news}?page=${pageParam}&page_size=${PAGE_SIZE}`),
    apiRequest(`${API_ENDPOINTS.posts.list}?page=${pageParam}&per_page=${PAGE_SIZE}`),
  ])

  const newsArticles = newsData.status === 'fulfilled' ? newsData.value.articles || [] : []
  const userPosts = postsData.status === 'fulfilled' ? postsData.value.posts || [] : []

  const formattedNews = newsArticles.map((article) => ({
    id: article.id,
    title: article.title,
    description: article.description,
    image: article.image,
    author: article.author,
    timeAgo: new Date(article.publishedAt || 0).toLocaleDateString(),
    sortDate: new Date(article.publishedAt || 0).getTime(),
    likes: 0,
    comments: [],
    liked: false,
    saved: false,
  }))

  const formattedPosts = userPosts.map((p) => ({
    id: String(p.id),
    title: p.title || '',
    description: p.content,
    image: p.image_url || p.images?.[0]?.image_url,
    author: p.author?.username || 'User',
    timeAgo: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
    sortDate: p.created_at ? new Date(p.created_at).getTime() : 0,
    likes: p.likes_count || 0,
    comments: [],
    liked: false,
    saved: false,
  }))

  const items = [...formattedPosts, ...formattedNews].sort(
    (a, b) => (b.sortDate || 0) - (a.sortDate || 0)
  )

  const newsHasMore = newsData.status === 'fulfilled' ? (newsData.value.hasMore ?? false) : false
  const postsHasMore = postsData.status === 'fulfilled' && userPosts.length >= PAGE_SIZE

  return { items, nextPage: newsHasMore || postsHasMore ? pageParam + 1 : undefined }
}

/**
 * Server state for the home feed via TanStack Query:
 * caching, deduping, retries, and infinite pagination for free.
 */
export function useFeed() {
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const posts = query.data ? query.data.pages.flatMap((page) => page.items) : []

  return { ...query, posts }
}

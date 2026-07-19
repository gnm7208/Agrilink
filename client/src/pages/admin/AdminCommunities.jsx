import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, Trash2, Users } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../../config/api'

export function AdminCommunities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), per_page: '20' })
      if (search) params.set('search', search)
      const data = await apiRequest(`${API_ENDPOINTS.admin.communities}?${params.toString()}`)
      setCommunities(data.communities || [])
      setPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load communities')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities])

  const handleDelete = async (community) => {
    const reason = window.prompt(`Delete "${community.name}"? Optionally provide a reason:`)
    if (reason === null) return
    setBusyId(community.id)
    try {
      await apiRequest(API_ENDPOINTS.admin.deleteCommunity(community.id), {
        method: 'DELETE',
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      })
      setCommunities((prev) => prev.filter((c) => c.id !== community.id))
    } catch (err) {
      setError(err.message || 'Failed to delete community')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          placeholder="Search communities..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-8">{error}</p>
      ) : communities.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No communities found.</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
          {communities.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Link to={`/communities/${c.id}`} className="flex-1 min-w-0 hover:underline">
                <p className="font-medium text-gray-900 truncate">{c.name}</p>
                {c.description && <p className="text-xs text-gray-500 truncate">{c.description}</p>}
              </Link>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={14} />
                {c.member_count ?? 0}
              </span>
              <button
                onClick={() => handleDelete(c)}
                disabled={busyId === c.id}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                title="Delete community"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

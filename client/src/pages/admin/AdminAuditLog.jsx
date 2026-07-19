import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, ScrollText } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../../config/api'

export function AdminAuditLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const fetchLog = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), per_page: '25' })
      const data = await apiRequest(`${API_ENDPOINTS.admin.auditLog}?${params.toString()}`)
      setEntries(data.entries || [])
      setPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-8">{error}</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ScrollText size={32} className="mx-auto mb-2" />
          No moderation actions recorded yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
          {entries.map((e) => (
            <div key={e.id} className="px-4 py-3">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{e.admin_username || `Admin #${e.admin_id}`}</span>{' '}
                <span className="text-gray-500">{e.action.replace(/_/g, ' ')}</span>{' '}
                <span className="text-gray-400">{e.target_type} #{e.target_id}</span>
              </p>
              {e.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {e.reason}</p>}
              <p className="text-xs text-gray-400 mt-0.5">
                {e.created_at ? new Date(e.created_at).toLocaleString() : ''}
              </p>
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

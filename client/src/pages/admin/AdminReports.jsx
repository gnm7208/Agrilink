import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Flag, Check, X } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../../config/api'

const TARGET_LINK = {
  post: (id) => `/post/${id}`,
  comment: () => null,
  user: (id) => `/admin/users/${id}`,
}

export function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), per_page: '20', status })
      const data = await apiRequest(`${API_ENDPOINTS.admin.reports}?${params.toString()}`)
      setReports(data.reports || [])
      setPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const resolveReport = async (report, newStatus) => {
    setBusyId(report.id)
    try {
      await apiRequest(API_ENDPOINTS.admin.reportStatus(report.id), {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (err) {
      setError(err.message || 'Failed to update report')
    } finally {
      setBusyId(null)
    }
  }

  const deleteContent = async (report) => {
    if (!window.confirm(`Delete this ${report.target_type} and resolve the report?`)) return
    setBusyId(report.id)
    try {
      if (report.target_type === 'post') {
        await apiRequest(API_ENDPOINTS.admin.deletePost(report.target_id), {
          method: 'DELETE',
          body: JSON.stringify({ reason: `Report #${report.id}: ${report.reason}` }),
        })
      } else if (report.target_type === 'comment') {
        await apiRequest(API_ENDPOINTS.admin.deleteComment(report.target_id), {
          method: 'DELETE',
          body: JSON.stringify({ reason: `Report #${report.id}: ${report.reason}` }),
        })
      } else if (report.target_type === 'user') {
        await apiRequest(API_ENDPOINTS.admin.userStatus(report.target_id), {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'suspended',
            reason: `Report #${report.id}: ${report.reason}`,
          }),
        })
      }
      await apiRequest(API_ENDPOINTS.admin.reportStatus(report.id), {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' }),
      })
      setReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (err) {
      setError(err.message || 'Failed to take action')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(1)
              setStatus(s)
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
              status === s
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 border border-gray-200 dark:border-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-8">{error}</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Flag size={32} className="mx-auto mb-2" />
          No {status} reports.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
          {reports.map((r) => {
            const link = TARGET_LINK[r.target_type]?.(r.target_id)
            return (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 capitalize">
                    {r.target_type} &middot; {r.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                  </span>
                </div>
                {link ? (
                  <Link to={link} className="text-sm text-gray-900 hover:underline">
                    {r.target_preview}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-900">{r.target_preview}</p>
                )}
                {r.details && (
                  <p className="text-xs text-gray-500 mt-0.5">{r.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Reported by {r.reporter_username || `user #${r.reporter_id}`}
                </p>

                {status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => deleteContent(r)}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Take action
                    </button>
                    <button
                      onClick={() => resolveReport(r, 'dismissed')}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <X size={12} />
                      Dismiss
                    </button>
                    <button
                      onClick={() => resolveReport(r, 'resolved')}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <Check size={12} />
                      Mark resolved
                    </button>
                  </div>
                )}
              </div>
            )
          })}
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

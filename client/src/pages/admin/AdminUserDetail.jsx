import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { apiRequest, API_ENDPOINTS } from '../../config/api'

export function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiRequest(API_ENDPOINTS.admin.userById(id))
      setUser(data)
    } catch (err) {
      setError(err.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const changeStatus = async (status) => {
    setBusy(true)
    setActionError(null)
    try {
      const updated = await apiRequest(API_ENDPOINTS.admin.userStatus(id), {
        method: 'PATCH',
        body: JSON.stringify({ status, reason: reason.trim() || undefined }),
      })
      setUser((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message || 'Failed to update status')
    } finally {
      setBusy(false)
    }
  }

  const changeRole = async (role) => {
    setBusy(true)
    setActionError(null)
    try {
      const updated = await apiRequest(API_ENDPOINTS.admin.userRole(id), {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      setUser((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message || 'Failed to update role')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.username} and all their content? This cannot be undone.`)) {
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await apiRequest(API_ENDPOINTS.admin.userById(id), {
        method: 'DELETE',
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      })
      navigate('/admin/users')
    } catch (err) {
      setActionError(err.message || 'Failed to delete user')
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-3">{error || 'User not found'}</p>
        <Link to="/admin/users" className="text-green-600 text-sm font-medium">Back to Users</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} />
        Back to Users
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <Avatar src={user.profile_image_url} fallback={user.username} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{user.role}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{user.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center bg-gray-50 rounded-xl py-3">
            <p className="text-lg font-bold text-gray-900">{user.posts_count ?? 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-3">
            <p className="text-lg font-bold text-gray-900">{user.followers_count ?? 0}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-3">
            <p className="text-lg font-bold text-gray-900">{user.following_count ?? 0}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'unknown'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Moderation</h3>

        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>
        )}

        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional, applied to the next action)"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />

        <div className="flex flex-wrap gap-2">
          {user.status !== 'active' && (
            <Button size="sm" variant="outline" onClick={() => changeStatus('active')} isLoading={busy}>
              Reactivate
            </Button>
          )}
          {user.status !== 'suspended' && (
            <Button size="sm" variant="secondary" onClick={() => changeStatus('suspended')} isLoading={busy}>
              Suspend
            </Button>
          )}
          {user.status !== 'banned' && (
            <Button size="sm" variant="ghost" className="bg-red-50 text-red-700 hover:bg-red-100" onClick={() => changeStatus('banned')} isLoading={busy}>
              Ban
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          {['user', 'expert', 'admin'].filter((r) => r !== user.role).map((r) => (
            <Button key={r} size="sm" variant="outline" onClick={() => changeRole(r)} isLoading={busy}>
              Make {r}
            </Button>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-50">
          <Button
            size="sm"
            variant="ghost"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleDelete}
            isLoading={busy}
          >
            Delete Account Permanently
          </Button>
        </div>
      </div>
    </div>
  )
}

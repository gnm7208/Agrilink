import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, Users2, MessageSquare, Heart, MessageCircle, Flag, Loader2 } from 'lucide-react'
import { StatTile } from '../../components/admin/StatTile'
import { apiRequest, API_ENDPOINTS } from '../../config/api'

export function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest(API_ENDPOINTS.admin.stats)
        setStats(data)
      } catch (err) {
        setError(err.message || 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>
  }

  const trend = stats.new_users_by_day || []
  const maxCount = Math.max(1, ...trend.map((d) => d.count))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Total Users" value={stats.total_users} icon={Users} hint={`+${stats.new_users_7d} this week`} />
        <StatTile label="Total Posts" value={stats.total_posts} icon={FileText} />
        <StatTile label="Communities" value={stats.total_communities} icon={Users2} />
        <StatTile label="Messages Sent" value={stats.total_messages} icon={MessageSquare} />
        <StatTile label="Likes" value={stats.total_likes} icon={Heart} />
        <StatTile label="Comments" value={stats.total_comments} icon={MessageCircle} />
        <StatTile label="New Users (30d)" value={stats.new_users_30d} icon={Users} />
        <StatTile label="Active Users (7d)" value={stats.active_users_7d} icon={Users} hint="Posted or commented" />
        <Link to="/admin/reports">
          <StatTile
            label="Pending Reports"
            value={stats.pending_reports}
            icon={Flag}
            hint={stats.pending_reports > 0 ? 'Needs review' : 'All clear'}
          />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">New users — last 30 days</h2>
        {trend.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No signups in this period.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {trend.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                />
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  {d.date}: {d.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

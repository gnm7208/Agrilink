import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2, Trash2, TrendingUp, X } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export function MarketPrices() {
  const { user } = useAuth()
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cropFilter, setCropFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [busyId, setBusyId] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [crop, setCrop] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('per 90kg bag')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), per_page: '20' })
      if (cropFilter) params.set('crop', cropFilter)
      if (locationFilter) params.set('location', locationFilter)
      const data = await apiRequest(`${API_ENDPOINTS.market.list}?${params.toString()}`)
      setPrices(data.prices || [])
      setPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load market prices')
    } finally {
      setLoading(false)
    }
  }, [page, cropFilter, locationFilter])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!crop.trim() || !location.trim() || !unit.trim()) {
      setFormError('Crop, price, unit, and location are required')
      return
    }
    const priceNum = parseFloat(price)
    if (!priceNum || priceNum <= 0) {
      setFormError('Enter a valid price')
      return
    }
    setSubmitting(true)
    try {
      await apiRequest(API_ENDPOINTS.market.create, {
        method: 'POST',
        body: JSON.stringify({
          crop: crop.trim(),
          price: priceNum,
          unit: unit.trim(),
          location: location.trim(),
          notes: notes.trim() || undefined,
        }),
      })
      setShowForm(false)
      setCrop('')
      setPrice('')
      setLocation('')
      setNotes('')
      setPage(1)
      fetchPrices()
    } catch (err) {
      setFormError(err.message || 'Failed to submit price')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`Remove this ${entry.crop} price report?`)) return
    setBusyId(entry.id)
    try {
      await apiRequest(API_ENDPOINTS.market.delete(entry.id), { method: 'DELETE' })
      setPrices((prev) => prev.filter((p) => p.id !== entry.id))
    } catch (err) {
      setError(err.message || 'Failed to delete price report')
    } finally {
      setBusyId(null)
    }
  }

  const canDelete = (entry) => user && (user.id === entry.posted_by || user.role === 'admin')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Market Prices
          </h1>
          <p className="text-xs text-gray-500">Community-reported local crop prices</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Report Price
        </button>
      </header>

      <div className="px-4 py-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={cropFilter}
            onChange={(e) => {
              setPage(1)
              setCropFilter(e.target.value)
            }}
            placeholder="Filter by crop..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
        <input
          value={locationFilter}
          onChange={(e) => {
            setPage(1)
            setLocationFilter(e.target.value)
          }}
          placeholder="Location..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : prices.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp size={32} className="mx-auto mb-2" />
            No price reports yet. Be the first to share one.
          </div>
        ) : (
          prices.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900">{p.crop}</h3>
                  <p className="text-2xl font-bold text-green-600 mt-0.5">
                    KES {p.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500"> {p.unit}</span>
                  </p>
                </div>
                {canDelete(p) && (
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {p.notes && <p className="text-sm text-gray-600 mt-2">{p.notes}</p>}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{p.location}</span>
                <span>
                  {p.poster_username || 'Unknown'} &middot;{' '}
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report a Price</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="Crop (e.g. Maize)"
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (KES)"
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit (e.g. per 90kg bag)"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Nakuru, Kenya)"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-gray-900 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Price'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React from 'react'

export function StatTile({ label, value, icon: Icon, hint }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        {Icon && <Icon size={16} className="text-green-600" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

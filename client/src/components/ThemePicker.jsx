import React from 'react'
import { Sun, Moon, Check } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { MAIN_THEME_CATEGORIES } from '../config/themes'

export function ThemePicker() {
  const { theme, mode, setTheme, toggleMode } = useTheme()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Appearance</h3>
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          {mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          {mode === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      {MAIN_THEME_CATEGORIES.map((cat) => (
        <div key={cat.category}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {cat.category}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {cat.themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-colors ${
                  theme === t.id ? 'border-green-600' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: t.swatch }}
                >
                  {theme === t.id && <Check size={16} className="text-white" />}
                </span>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

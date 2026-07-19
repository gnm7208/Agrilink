import React, { useState, useRef, useEffect } from 'react'
import { Palette, Sun, Moon, Check } from 'lucide-react'
import { useAdminTheme } from '../../hooks/useTheme'
import { ADMIN_THEME_CATEGORIES } from '../../config/themes'

export function AdminThemePicker() {
  const { theme, mode, setTheme, toggleMode } = useAdminTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="Appearance"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-lg p-4 z-50 text-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Appearance</h4>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              {mode === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
              {mode === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {ADMIN_THEME_CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  {cat.category}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        theme === t.id
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: t.swatch }}
                      >
                        {theme === t.id && <Check size={10} className="text-white" />}
                      </span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

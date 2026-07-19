import React, { useState, useEffect, useCallback } from 'react';
import { AdminThemeContext } from './themeContext';
import { DEFAULT_ADMIN_THEME } from '../config/themes';

const THEME_KEY = 'agrilink_admin_theme';
const MODE_KEY = 'agrilink_admin_mode';

function getInitialMode() {
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Same shape as ThemeProvider, but scoped to a wrapper element (via the
 * returned data-admin-theme/dark attributes on a container) instead of
 * <html>, so an admin's dashboard appearance never affects the public app.
 */
export function AdminThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || DEFAULT_ADMIN_THEME);
  const [mode, setModeState] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const setTheme = useCallback((id) => setThemeState(id), []);
  const setMode = useCallback((m) => setModeState(m), []);
  const toggleMode = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  return (
    <AdminThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      <div data-admin-theme={theme} className={mode === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

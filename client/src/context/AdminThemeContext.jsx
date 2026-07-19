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

  // Tailwind's `dark:` variant matches ANY `.dark` ancestor, not just the
  // nearest one — so scoping `dark` to this provider's own wrapper div isn't
  // enough if <html> already has `dark` from the main app's ThemeContext.
  // Force <html> to reflect the admin's own mode while mounted, then hand
  // control back to whatever the main app's preference is on unmount.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    return () => {
      const mainMode = localStorage.getItem('agrilink_mode');
      const shouldBeDark =
        mainMode === 'dark' ||
        (mainMode !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };
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

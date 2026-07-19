import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './themeContext';
import { DEFAULT_MAIN_THEME } from '../config/themes';

const THEME_KEY = 'agrilink_theme';
const MODE_KEY = 'agrilink_mode';

function getInitialMode() {
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || DEFAULT_MAIN_THEME);
  const [mode, setModeState] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const setTheme = useCallback((id) => setThemeState(id), []);
  const setMode = useCallback((m) => setModeState(m), []);
  const toggleMode = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}


'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'rose' | 'mint' | 'indigo' | 'gold' | 'slate';
const ALL_THEMES: Theme[] = ['light', 'dark', 'ocean', 'sunset', 'forest', 'rose', 'mint', 'indigo', 'gold', 'slate'];
const PREMIUM_THEMES: Theme[] = ['ocean', 'sunset', 'forest', 'rose', 'mint', 'indigo', 'gold', 'slate'];

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  premiumThemes: Theme[];
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

const THEME_STORAGE_KEY = 'cura-theme';
const LAST_NON_PREMIUM_THEME_KEY = 'cura-theme-last-non-premium';


export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (storedTheme && ALL_THEMES.includes(storedTheme)) {
      setThemeState(storedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (!ALL_THEMES.includes(newTheme)) return;

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    if (!PREMIUM_THEMES.includes(newTheme)) {
      localStorage.setItem(LAST_NON_PREMIUM_THEME_KEY, newTheme);
    }
    
    // When a user manually sets a theme, we should also record this intent.
    localStorage.setItem('cura-theme-manual-choice', 'true');
    setThemeState(newTheme);
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...ALL_THEMES);
    
    if (theme === 'dark' || theme === 'indigo' || theme === 'slate' || theme === 'gold') {
      root.classList.add('dark');
    }
    root.classList.add(theme);

  }, [theme]);


  const value = {
    theme,
    setTheme,
    premiumThemes: PREMIUM_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

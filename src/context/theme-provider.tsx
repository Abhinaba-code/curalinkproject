'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'dark' | 'ocean' | 'sunset' | 'forest';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

const THEME_STORAGE_KEY = 'cura-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('dark', 'theme-ocean', 'theme-sunset', 'theme-forest');

    if (theme === 'default') {
      // default is just no class
    } else {
       root.classList.add(theme === 'dark' ? 'dark' : `theme-${theme}`);
    }
  }, [theme]);


  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

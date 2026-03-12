import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme, ThemeName } from '../types/theme';
import { getTheme } from '../styles/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('smartsheet-theme') as ThemeName;
    if (savedTheme && ['light', 'dark', 'ocean', 'sunset', 'forest', 'royal'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const theme = getTheme(themeName);

  const handleSetTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    localStorage.setItem('smartsheet-theme', newThemeName);
  };

  const value: ThemeContextType = {
    theme,
    themeName,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-language-coach-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const darkMode = stored ? JSON.parse(stored) : prefersDark;
      
      setIsDark(darkMode);
      applyTheme(darkMode);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load theme preference', error);
      setIsLoaded(true);
    }
  }, []);

  const applyTheme = (dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const toggleDarkMode = (dark) => {
    setIsDark(dark);
    applyTheme(dark);
    try {
      localStorage.setItem('ai-language-coach-theme', JSON.stringify(dark));
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

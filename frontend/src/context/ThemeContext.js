"use client";
// context/ThemeContext.js
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

// Define your palette objects
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#4776E6',
    light: '#6C92FF',
    dark: '#3358B4',
    contrastText: '#FFFFFF',
  },
  // ... rest of light palette
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#5D8DF7',
    light: '#80ABFF',
    dark: '#3D6CD9',
    contrastText: '#1A1A1A',
  },
  // ... rest of dark palette
};

// Create the theme components with our palette options
const getThemeOptions = (mode) => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  // ... rest of theme options
});

export const ThemeProvider = ({ children }) => {
  // Start with a default theme for SSR
  const [mode, setMode] = useState('light');
  
  // Handle client-side initialization separately
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check localStorage first
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      // If no saved preference, check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
    
    setIsInitialized(true);
  }, []);
  
  // Create the theme object with the current mode
  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);
  
  // Toggle theme function to expose via context
  const toggleColorMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', newMode);
      }
      return newMode;
    });
  };
  
  // Effect to sync with system preferences if user changes OS theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only apply system preference if user hasn't manually set a preference
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Safari < 14 support
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  // Apply theme to document body
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.dataset.theme = mode;
  }, [mode]);
  
  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, isInitialized }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
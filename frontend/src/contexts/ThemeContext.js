"use client";
// 1. Create a theme context and provider (in a new file like '/context/ThemeContext.js')
import React, { createContext, useState, useEffect, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ThemeContext = createContext();

// Define your palette objects
const lightPalette = {
  mode: "light",
  primary: {
    main: "#4776E6",
    light: "#6C92FF",
    dark: "#3358B4",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#8E54E9",
    light: "#A67FF0",
    dark: "#7038C9",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F8FAFF",
    paper: "#FFFFFF",
    subtle: "rgba(95, 150, 230, 0.05)",
    gradient: "linear-gradient(to right, #4776E6, #8E54E9)",
  },
  text: {
    primary: "#2A3548",
    secondary: "#607080",
    disabled: "#A0AEC0",
  },
  divider: "rgba(95, 150, 230, 0.1)",
  action: {
    active: "#4776E6",
    hover: "rgba(71, 118, 230, 0.1)",
  },
  shadow: {
    card: "0 8px 25px rgba(95, 150, 230, 0.12)",
    button: "0 4px 10px rgba(71, 118, 230, 0.3)",
    hover: "0 12px 28px rgba(95, 150, 230, 0.2)",
  },
};

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#5D8DF7",
    light: "#80ABFF",
    dark: "#3D6CD9",
    contrastText: "#1A1A1A",
  },
  secondary: {
    main: "#A67FF0",
    light: "#BF9FF5",
    dark: "#8E54E9",
    contrastText: "#1A1A1A",
  },
  background: {
    default: "#121212",
    paper: "#1E1E1E",
    subtle: "rgba(93, 141, 247, 0.1)",
    gradient: "linear-gradient(to right, #3D6CD9, #8E54E9)",
  },
  text: {
    primary: "#E0E0E0",
    secondary: "#A0AEC0",
    disabled: "#6B7280",
  },
  divider: "rgba(255, 255, 255, 0.1)",
  action: {
    active: "#5D8DF7",
    hover: "rgba(93, 141, 247, 0.15)",
  },
  shadow: {
    card: "0 8px 25px rgba(0, 0, 0, 0.5)",
    button: "0 4px 10px rgba(93, 141, 247, 0.3)",
    hover: "0 12px 28px rgba(0, 0, 0, 0.6)",
  },
};

// Create the theme components with our palette options
const getThemeOptions = (mode) => ({
  palette: mode === "light" ? lightPalette : darkPalette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          textTransform: "none",
          fontWeight: 500,
        },
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: theme.palette.shadow.button,
            transform: "translateY(-2px)",
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: theme.palette.shadow.card,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": {
            boxShadow: theme.palette.shadow.hover,
          },
        }),
      },
    },
    // Add more component customizations as needed
  },
});

export const ThemeProvider = ({ children }) => {
  // Check if localStorage is available (to prevent SSR issues)
  const isLocalStorageAvailable =
    typeof window !== "undefined" && window.localStorage;

  // Get the initial mode from localStorage or use 'light' as default
  const storedTheme = isLocalStorageAvailable
    ? localStorage.getItem("themeMode")
    : null;
  const [mode, setMode] = useState(storedTheme || "light");

  // Create the theme object with the current mode
  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // Toggle theme function to expose via context
  const toggleColorMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    if (isLocalStorageAvailable) {
      localStorage.setItem("themeMode", newMode);
    }
  };

  // Effect to sync with system preferences if no stored preference
  useEffect(() => {
    if (!storedTheme && isLocalStorageAvailable) {
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, [storedTheme, isLocalStorageAvailable]);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
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
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

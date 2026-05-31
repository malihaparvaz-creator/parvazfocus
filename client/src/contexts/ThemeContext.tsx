import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = string;

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  applyTheme?: (theme: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove any theme-* classes first
    Array.from(root.classList)
      .filter(c => c.startsWith('theme-') || c === 'dark')
      .forEach(c => root.classList.remove(c));

    // Remove any focus-room classes that might interfere with theme
    Array.from(root.classList)
      .filter(c => c.startsWith('focus-room-'))
      .forEach(c => root.classList.remove(c));

    // Add applied theme class
    const themeClass = `theme-${theme}`;
    root.classList.add(themeClass);

    // Also add legacy 'dark' class for dark theme support
    if (theme === 'dark') root.classList.add('dark');

    if (switchable) {
      try { localStorage.setItem("theme", theme); } catch (e) {}
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
      }
    : undefined;

  const applyTheme = switchable
    ? (t: Theme) => setThemeState(t)
    : undefined;

  // Listen for external themeChange events (e.g., purchases)
  useEffect(() => {
    function onThemeChange(e: any) {
      const newTheme = e?.detail?.theme;
      if (switchable && newTheme) setThemeState(newTheme);
    }
    window.addEventListener('themeChange', onThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', onThemeChange as EventListener);
  }, [switchable]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

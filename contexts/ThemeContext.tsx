'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActive: string;
  cardBg: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  setColors: (colors: ThemeColors) => void;
  resetColors: () => void;
}

const defaultColors: ThemeColors = {
  primary: '#06d937',
  secondary: '#dc2626',
  accent: '#f97316',
  sidebarBg: '#1a0a00',
  sidebarText: '#cbd5e1',
  sidebarActive: '#06d937',
  cardBg: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  setColors: () => {},
  resetColors: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(defaultColors);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardTheme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColorsState(parsed);
      } catch {}
    }
  }, []);

  const setColors = (newColors: ThemeColors) => {
    setColorsState(newColors);
    localStorage.setItem('dashboardTheme', JSON.stringify(newColors));
  };

  const resetColors = () => {
    setColorsState(defaultColors);
    localStorage.removeItem('dashboardTheme');
  };

  return (
    <ThemeContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
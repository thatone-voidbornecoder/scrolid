'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: '#c084fc',
  setAccentColor: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState('#c084fc');

  useEffect(() => {
    const saved = localStorage.getItem('scrolid-accent');
    if (saved) {
      setAccentColorState(saved);
      document.documentElement.style.setProperty('--accent', saved);
    } else {
      document.documentElement.style.setProperty('--accent', '#c084fc');
    }
  }, []);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('scrolid-accent', color);
    document.documentElement.style.setProperty('--accent', color);
  };

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

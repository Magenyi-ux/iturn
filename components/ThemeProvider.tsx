
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'navy' | 'emerald' | 'crimson';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
}

const themes: Record<ThemeType, ThemeColors> = {
  navy: {
    primary: '#0A1128',
    secondary: '#D4AF37',
    accent: '#AA8822',
    background: '#F8F5F2',
    surface: '#FFFFFF',
    text: '#0A1128',
    textSecondary: '#6B7280',
  },
  emerald: {
    primary: '#064E3B',
    secondary: '#E5E7EB',
    accent: '#9CA3AF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#064E3B',
    textSecondary: '#4B5563',
  },
  crimson: {
    primary: '#7F1D1D',
    secondary: '#FDE68A',
    accent: '#F59E0B',
    background: '#FFFBEB',
    surface: '#FFFFFF',
    text: '#7F1D1D',
    textSecondary: '#92400E',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('atelier_theme');
    return (saved as ThemeType) || 'navy';
  });

  useEffect(() => {
    localStorage.setItem('atelier_theme', theme);
    // Apply theme variables to root
    const colors = themes[theme];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

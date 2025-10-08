import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Inizializza tema da localStorage o preferenze sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Fallback a prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeState(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Rimuovi classe precedente
    root.classList.remove('light', 'dark');
    
    // Aggiungi nuova classe
    root.classList.add(newTheme);
    
    // Applica CSS custom properties per compatibilità
    if (newTheme === 'dark') {
      root.style.setProperty('--background', '#0f0a1a');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--card', '#2b0048');
      root.style.setProperty('--card-foreground', '#ffffff');
      root.style.setProperty('--primary', '#510357');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--accent', '#e774f0');
      root.style.setProperty('--muted', '#2d1b3d');
      root.style.setProperty('--muted-foreground', '#a1a1aa');
      root.style.setProperty('--border', 'rgba(231, 116, 240, 0.3)');
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#510357');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#510357');
      root.style.setProperty('--primary', '#510357');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--accent', '#e774f0');
      root.style.setProperty('--muted', '#f8fafc');
      root.style.setProperty('--muted-foreground', '#64748b');
      root.style.setProperty('--border', '#e2e8f0');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

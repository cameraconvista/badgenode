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
  // Pre-apply tema per evitare flash
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Fallback a prefers-color-scheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Applica tema immediatamente all'avvio
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Rimuovi classe precedente
    root.classList.remove('light', 'dark');
    
    // Aggiungi nuova classe e dataset
    root.classList.add(newTheme);
    root.dataset.theme = newTheme;
    
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
      // Applica background per pagina admin
      document.body.style.background = 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)';
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#510357');
      root.style.setProperty('--card', '#f8fafc');
      root.style.setProperty('--card-foreground', '#510357');
      root.style.setProperty('--primary', '#510357');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--accent', '#e774f0');
      root.style.setProperty('--muted', '#f1f5f9');
      root.style.setProperty('--muted-foreground', '#64748b');
      root.style.setProperty('--border', '#e2e8f0');
      // Applica background light per pagina admin
      document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
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

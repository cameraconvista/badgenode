import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Inizializza tema da localStorage o preferenze sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Fallback a prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
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
      root.classList.remove('dark');
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`p-2 hover:bg-accent/10 transition-colors ${className}`}
      aria-label={`Passa al tema ${theme === 'dark' ? 'chiaro' : 'scuro'}`}
    >
      {theme === 'dark' ? (
        // Icona sole per passare a light mode
        <svg
          className="w-5 h-5 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Icona luna per passare a dark mode
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </Button>
  );
}

import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`p-2 hover:bg-white/10 transition-colors ${className}`}
      aria-label={`Passa al tema ${theme === 'dark' ? 'chiaro' : 'scuro'}`}
      aria-pressed={theme === 'light'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-white !text-white" style={{ color: '#ffffff' }} />
      ) : (
        <Moon className="w-5 h-5 text-white !text-white" style={{ color: '#ffffff' }} />
      )}
    </Button>
  );
}

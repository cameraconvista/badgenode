import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onSettings: () => void;
}

export default function Keypad({ onKeyPress, onClear, onSettings }: KeypadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⚙'],
  ];

  const handlePress = (key: string) => {
    if (key === 'C') {
      onClear();
    } else if (key === '⚙') {
      onSettings();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {keys.flat().map((key) => (
        <Button
          key={key}
          data-testid={`button-key-${key === '⚙' ? 'settings' : key === 'C' ? 'clear' : key}`}
          variant="outline"
          size="lg"
          onClick={() => handlePress(key)}
          className="h-16 text-2xl font-semibold border-2 border-ring/30 hover-elevate active-elevate-2"
        >
          {key === '⚙' ? <Settings className="w-6 h-6" /> : key}
        </Button>
      ))}
    </div>
  );
}

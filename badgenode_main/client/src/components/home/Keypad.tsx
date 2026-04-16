import KeyButton from './KeyButton';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onSettings: () => void;
  className?: string;
}

export default function Keypad({ onKeyPress, onClear, onSettings, className = '' }: KeypadProps) {
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
    <div className={`w-full mb-4 ${className}`}>
      <div className="grid grid-cols-3 grid-rows-4 gap-3 max-w-[280px] mx-auto place-items-center px-2">
        {keys.flat().map((key) => (
          <KeyButton key={key} value={key} onClick={handlePress} />
        ))}
      </div>
    </div>
  );
}

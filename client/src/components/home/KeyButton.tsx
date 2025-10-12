import { Settings } from 'lucide-react';

interface KeyButtonProps {
  value: string;
  onClick: (key: string) => void;
  className?: string;
}

export default function KeyButton({ value, onClick, className = '' }: KeyButtonProps) {
  const handleClick = () => {
    onClick(value);
  };

  return (
    <button
      data-testid={`button-key-${value === '⚙' ? 'settings' : value === 'C' ? 'clear' : value}`}
      onClick={handleClick}
      className={`
        w-[72px] h-[72px] md:w-[76px] md:h-[76px]
        rounded-full
        text-xl md:text-2xl font-medium text-white
        transition-all duration-200
        active:scale-95
        focus-visible:ring-2 focus-visible:ring-offset-1
        flex items-center justify-center
        ${className}
      `}
      style={
        {
          backgroundColor: '#3a0a57',
          borderColor: 'rgba(231, 116, 240, 0.4)',
          borderWidth: '2px',
          borderStyle: 'solid',
          '--tw-ring-color': '#e774f0',
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(231, 116, 240, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(231, 116, 240, 0.4)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(231, 116, 240, 0.15)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#3a0a57';
      }}
    >
      {value === '⚙' ? <Settings className="w-5 h-5 md:w-6 md:h-6" /> : value}
    </button>
  );
}

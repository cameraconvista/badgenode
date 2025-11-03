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
        bg-[#3a0a57]
        border-2 border-[rgba(231,116,240,0.4)]
        hover:border-[rgba(231,116,240,0.7)]
        active:bg-[rgba(231,116,240,0.15)]
        active:scale-95
        transition-all duration-150
        focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e774f0]
        flex items-center justify-center
        ${className}
      `}
    >
      {value === '⚙' ? <Settings className="w-5 h-5 md:w-6 md:h-6" /> : value}
    </button>
  );
}

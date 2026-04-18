import { Settings } from "@/lib/icons";

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
        w-[64px] h-[64px]
        sm:w-[68px] sm:h-[68px]
        md:w-[76px] md:h-[76px]
        lg:w-[80px] lg:h-[80px]
        rounded-full
        text-lg sm:text-xl md:text-2xl font-medium text-[#1C0A10]
        bg-[#FCF6EE]
        border-2 border-[rgba(122,18,40,0.25)]
        hover:border-[rgba(122,18,40,0.55)]
        active:bg-[rgba(122,18,40,0.10)]
        active:scale-95
        transition-colors duration-100
        focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#7A1228]
        flex items-center justify-center
        touch-manipulation
        shadow-sm active:shadow-md
        ${className}
      `}
    >
      {value === '⚙' ? <Settings className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : value}
    </button>
  );
}

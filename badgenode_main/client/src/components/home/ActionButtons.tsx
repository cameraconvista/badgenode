interface ActionButtonsProps {
  onEntrata: () => void;
  onUscita: () => void;
  disabled?: boolean; // disable both
  disabledEntrata?: boolean; // disable only Entrata
  disabledUscita?: boolean; // disable only Uscita
  className?: string;
}

export default function ActionButtons({
  onEntrata,
  onUscita,
  disabled = false,
  disabledEntrata = false,
  disabledUscita = false,
  className = '',
}: ActionButtonsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto px-2">
        <button
          data-testid="button-entrata"
          onClick={onEntrata}
          disabled={disabled || disabledEntrata}
          className="
            min-h-[56px] px-6
            rounded-full
            font-semibold text-base md:text-lg tracking-wide uppercase
            text-white bg-green-600
            transition-all duration-200
            hover:bg-green-500 hover:brightness-110
            active:scale-98
            focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-400
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          ENTRATA
        </button>
        <button
          data-testid="button-uscita"
          onClick={onUscita}
          disabled={disabled || disabledUscita}
          className="
            min-h-[56px] px-6
            rounded-full
            font-semibold text-base md:text-lg tracking-wide uppercase
            text-white bg-red-600
            transition-all duration-200
            hover:bg-red-500 hover:brightness-110
            active:scale-98
            focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-400
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          USCITA
        </button>
      </div>
    </div>
  );
}

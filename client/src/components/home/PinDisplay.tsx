interface PinDisplayProps {
  pin: string;
  maxLength?: number;
  className?: string;
}

export default function PinDisplay({ pin, maxLength: _maxLength, className = '' }: PinDisplayProps) {
  void _maxLength;
  const isEmpty = pin.length === 0;

  return (
    <div className={`w-full mb-2 sm:mb-3 flex flex-col items-center ${className}`}>
      <div
        data-testid="display-pin"
        className="w-full max-w-[240px] sm:max-w-[260px] rounded-2xl px-4 py-2.5 text-center"
        style={{
          backgroundColor: '#F8F3EE',
          border: '2px solid rgba(122,18,40,0.28)',
          boxShadow: 'inset 0 2px 6px rgba(122,18,40,0.07)',
        }}
      >
        <div
          className="text-xl sm:text-2xl font-bold tracking-[0.2em] sm:tracking-[0.25em] min-h-[2rem] sm:min-h-[2.25rem] flex items-center justify-center"
          style={{ color: isEmpty ? 'rgba(122,18,40,0.35)' : '#1C0A10' }}
        >
          {isEmpty ? 'PIN' : pin}
        </div>
      </div>
    </div>
  );
}

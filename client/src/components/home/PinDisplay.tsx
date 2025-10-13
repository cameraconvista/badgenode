interface PinDisplayProps {
  pin: string;
  maxLength?: number;
  className?: string;
}

export default function PinDisplay({ pin, maxLength: _maxLength, className = '' }: PinDisplayProps) {
  void _maxLength;
  return (
    <div className={`w-full mb-4 ${className}`}>
      <div
        data-testid="display-pin"
        className="bg-white/95 rounded-2xl px-4 py-3 text-center mx-auto max-w-[210px]"
      >
        <div className="text-2xl md:text-3xl font-semibold tracking-[0.2em] min-h-[2.5rem] flex items-center justify-center text-gray-800">
          {pin.length > 0 ? pin : 'PIN'}
        </div>
      </div>
    </div>
  );
}

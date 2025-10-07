interface PinDisplayProps {
  pin: string;
  maxLength?: number;
}

export default function PinDisplay({ pin, maxLength = 4 }: PinDisplayProps) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        data-testid="display-pin"
        className="bg-card border-2 border-ring rounded-lg px-6 py-4 text-center"
      >
        <div className="text-3xl font-mono tracking-[0.5em] text-muted-foreground min-h-[2.5rem] flex items-center justify-center">
          {pin.length > 0 ? '•'.repeat(pin.length) : 'PIN'}
        </div>
      </div>
    </div>
  );
}

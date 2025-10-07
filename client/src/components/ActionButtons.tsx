import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onEntrata: () => void;
  onUscita: () => void;
  disabled?: boolean;
}

export default function ActionButtons({
  onEntrata,
  onUscita,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto">
      <Button
        data-testid="button-entrata"
        onClick={onEntrata}
        disabled={disabled}
        className="h-14 text-lg font-semibold bg-chart-1 hover:bg-chart-1 text-white border-0"
        style={{ backgroundColor: 'hsl(var(--chart-1))' }}
      >
        ENTRATA
      </Button>
      <Button
        data-testid="button-uscita"
        onClick={onUscita}
        disabled={disabled}
        className="h-14 text-lg font-semibold bg-chart-2 hover:bg-chart-2 text-white border-0"
        style={{ backgroundColor: 'hsl(var(--chart-2))' }}
      >
        USCITA
      </Button>
    </div>
  );
}

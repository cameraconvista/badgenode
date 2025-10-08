import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
}

export default function TableToolbar({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortToggle,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Ricerca */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          type="text"
          placeholder="Cerca per nome o cognome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Ordinamento PIN */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSortToggle}
        className="flex items-center gap-2"
      >
        PIN
        <svg
          className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </Button>
    </div>
  );
}

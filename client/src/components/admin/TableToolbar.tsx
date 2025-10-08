import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronUp } from 'lucide-react';

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cerca per nome o cognome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500"
        />
      </div>

      {/* Ordinamento PIN */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSortToggle}
        className="flex items-center gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        PIN
        <ChevronUp className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}

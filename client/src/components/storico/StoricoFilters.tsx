import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { formatDateLocal } from '@/lib/time';

interface StoricoFiltersProps {
  filters: {
    dal: string;
    al: string;
  };
  onFiltersChange: (filters: { dal: string; al: string }) => void;
  isLoading?: boolean;
}

export default function StoricoFilters({
  filters,
  onFiltersChange,
  isLoading,
}: StoricoFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('corrente');
  const dalInputRef = useRef<HTMLInputElement>(null);
  const alInputRef = useRef<HTMLInputElement>(null);

  // Calcola date per periodi predefiniti
  const getDateRanges = () => {
    const today = new Date();
    const currentMonth = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    };

    const previousMonth = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 0)),
    };

    const twoMonthsAgo = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 1, 0)),
    };

    return { currentMonth, previousMonth, twoMonthsAgo };
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const ranges = getDateRanges();

    switch (period) {
      case 'corrente':
        onFiltersChange(ranges.currentMonth);
        break;
      case 'precedente':
        onFiltersChange(ranges.previousMonth);
        break;
      case 'due_mesi_fa':
        onFiltersChange(ranges.twoMonthsAgo);
        break;
      case 'personalizzato':
        // Mantieni i filtri attuali per il periodo personalizzato
        break;
    }
  };

  const handleDateChange = (field: 'dal' | 'al', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
    // Se cambia manualmente le date, passa a personalizzato
    if (selectedPeriod !== 'personalizzato') {
      setSelectedPeriod('personalizzato');
    }
  };

  const handleCalendarClick = (field: 'dal' | 'al') => {
    const inputRef = field === 'dal' ? dalInputRef : alInputRef;
    if (inputRef.current) {
      // Prova prima showPicker() se supportato
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (error) {
          // Fallback: focus e click
          inputRef.current.focus();
          inputRef.current.click();
        }
      } else {
        // Fallback per browser che non supportano showPicker
        inputRef.current.focus();
        inputRef.current.click();

        // Trigger manuale dell'evento per aprire il picker
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        inputRef.current.dispatchEvent(event);
      }
    }
  };

  // const ranges = getDateRanges(); // Commentato per evitare warning unused

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Periodo Rapido */}
        <div className="space-y-2">
          <Label className="text-gray-200 text-base">Periodo</Label>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={isLoading}>
            <SelectTrigger
              className={`bg-gray-700/50 border-gray-600 text-base ${
                selectedPeriod === 'personalizzato' ? 'text-yellow-400' : 'text-white'
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Mese corrente</SelectItem>
              <SelectItem value="precedente">Mese precedente</SelectItem>
              <SelectItem value="due_mesi_fa">2 mesi fa</SelectItem>
              <SelectItem value="personalizzato">Personalizzato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Dal */}
        <div className="space-y-2">
          <Label htmlFor="dal" className="text-gray-200 text-base">
            Dal
          </Label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer z-10"
              onClick={() => handleCalendarClick('dal')}
            />
            <Input
              ref={dalInputRef}
              id="dal"
              type="date"
              value={filters.dal}
              onChange={(e) => handleDateChange('dal', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-violet-400 text-base cursor-pointer pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Data Al */}
        <div className="space-y-2">
          <Label htmlFor="al" className="text-gray-200 text-base">
            Al
          </Label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer z-10"
              onClick={() => handleCalendarClick('al')}
            />
            <Input
              ref={alInputRef}
              id="al"
              type="date"
              value={filters.al}
              onChange={(e) => handleDateChange('al', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-violet-400 text-base cursor-pointer pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

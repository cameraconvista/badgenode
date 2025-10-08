import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';
import { formatDateLocal } from '@/lib/time';

interface StoricoFiltersProps {
  filters: {
    dal: string;
    al: string;
  };
  onFiltersChange: (filters: { dal: string; al: string }) => void;
  isLoading?: boolean;
}

export default function StoricoFilters({ filters, onFiltersChange, isLoading }: StoricoFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('corrente');

  // Calcola date per periodi predefiniti
  const getDateRanges = () => {
    const today = new Date();
    const currentMonth = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0))
    };
    
    const previousMonth = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 0))
    };
    
    const twoMonthsAgo = {
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() - 1, 0))
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
      [field]: value
    });
    // Se cambia manualmente le date, passa a personalizzato
    if (selectedPeriod !== 'personalizzato') {
      setSelectedPeriod('personalizzato');
    }
  };

  // const ranges = getDateRanges(); // Commentato per evitare warning unused

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-violet-400" />
        <h3 className="text-xl font-semibold text-white">Filtri Periodo</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Periodo Rapido */}
        <div className="space-y-2">
          <Label className="text-gray-200 text-base">Periodo</Label>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={isLoading}>
            <SelectTrigger className={`bg-gray-700/50 border-gray-600 text-base ${
              selectedPeriod === 'personalizzato' ? 'text-yellow-400' : 'text-white'
            }`}>
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
          <Label htmlFor="dal" className="text-gray-200 text-base">Dal</Label>
          <div className="relative">
            <Input
              id="dal"
              type="date"
              value={filters.dal}
              onChange={(e) => handleDateChange('dal', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-violet-400 pl-10 text-base"
              disabled={isLoading}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Data Al */}
        <div className="space-y-2">
          <Label htmlFor="al" className="text-gray-200 text-base">Al</Label>
          <div className="relative">
            <Input
              id="al"
              type="date"
              value={filters.al}
              onChange={(e) => handleDateChange('al', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-violet-400 pl-10 text-base"
              disabled={isLoading}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Anteprima periodo selezionato */}
      <div className="text-base text-gray-400 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>
          Periodo selezionato: <strong className="text-white">{filters.dal}</strong> → <strong className="text-white">{filters.al}</strong>
        </span>
      </div>
    </div>
  );
}

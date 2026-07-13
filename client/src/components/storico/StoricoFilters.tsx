import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BnDatePicker from '@/components/ui/BnDatePicker';
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


  // const ranges = getDateRanges(); // Commentato per evitare warning unused

  return (
    <div className="bn-solid-surface bn-border rounded-xl px-4 md:px-6 py-3 md:py-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Periodo Rapido */}
        <div className="space-y-2">
          <Label className="text-[#7A5A64] text-base">Periodo</Label>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={isLoading}>
            <SelectTrigger
              className={
                `bg-[#FDFAF8] border border-[rgba(122,18,40,0.20)] text-[#1C0A10] rounded-xl h-9 px-3 pr-8 text-base focus:border-[#7A1228]`
              }
            >
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="z-50 bg-white border border-[rgba(122,18,40,0.18)] rounded-xl shadow-lg text-[#1C0A10]"
              sideOffset={8}
              align="start"
            >
              <SelectItem
                className="text-[#1C0A10] data-[highlighted]:bg-[rgba(122,18,40,0.08)] data-[highlighted]:text-[#1C0A10] data-[state=checked]:bg-[rgba(122,18,40,0.12)] data-[state=checked]:text-[#1C0A10] cursor-pointer select-none rounded-md px-3 py-2 outline-none pl-8"
                value="corrente"
              >
                Mese corrente
              </SelectItem>
              <SelectItem
                className="text-[#1C0A10] data-[highlighted]:bg-[rgba(122,18,40,0.08)] data-[highlighted]:text-[#1C0A10] data-[state=checked]:bg-[rgba(122,18,40,0.12)] data-[state=checked]:text-[#1C0A10] cursor-pointer select-none rounded-md px-3 py-2 outline-none pl-8"
                value="precedente"
              >
                Mese precedente
              </SelectItem>
              <SelectItem
                className="text-[#1C0A10] data-[highlighted]:bg-[rgba(122,18,40,0.08)] data-[highlighted]:text-[#1C0A10] data-[state=checked]:bg-[rgba(122,18,40,0.12)] data-[state=checked]:text-[#1C0A10] cursor-pointer select-none rounded-md px-3 py-2 outline-none pl-8"
                value="due_mesi_fa"
              >
                2 mesi fa
              </SelectItem>
              <SelectItem
                className="text-[#1C0A10] data-[highlighted]:bg-[rgba(122,18,40,0.08)] data-[highlighted]:text-[#1C0A10] data-[state=checked]:bg-[rgba(122,18,40,0.12)] data-[state=checked]:text-[#1C0A10] cursor-pointer select-none rounded-md px-3 py-2 outline-none pl-8"
                value="personalizzato"
              >
                Personalizzato
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Dal */}
        <div className="space-y-2">
          <Label htmlFor="dal" className="text-[#7A5A64] text-base">
            Dal
          </Label>
          <BnDatePicker
            id="dal"
            aria-label="Data dal"
            value={filters.dal}
            onChange={(v) => handleDateChange('dal', v)}
            disabled={isLoading}
          />
        </div>

        {/* Data Al */}
        <div className="space-y-2">
          <Label htmlFor="al" className="text-[#7A5A64] text-base">
            Al
          </Label>
          <BnDatePicker
            id="al"
            aria-label="Data al"
            value={filters.al}
            onChange={(v) => handleDateChange('al', v)}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

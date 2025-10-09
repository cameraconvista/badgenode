import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, FileText, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadTurniFull, TurnoFull, formatTimeOrDash } from '@/services/storico.service';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import { buildStoricoDataset } from '@/lib/storico/dataset';
import { UtentiService } from '@/services/utenti.service';
import { TimbratureService } from '@/services/timbrature.service';
import { useStoricoExport } from '@/hooks/useStoricoExport';
import { useStoricoMutations } from '@/hooks/useStoricoMutations';
import StoricoHeader from '@/components/storico/StoricoHeader';
import StoricoTable from '@/components/storico/StoricoTable';
import ModaleTimbrature from '@/components/storico/ModaleTimbrature';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateStoricoGlobale, invalidateTotaliGlobali, debounce } from '@/state/timbrature.cache';
import { formatDateLocal } from '@/lib/time';
import type { Utente } from '@/services/utenti.service';

interface StoricoTimbratureProps {
  pin?: number; // PIN del dipendente da visualizzare
}

export default function StoricoTimbrature({ pin = 7 }: StoricoTimbratureProps) {
  const { isAdmin } = useAuth();
  
  // State per filtri
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    return {
      pin,
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0))
    };
  });

  // State per modale modifica
  const [selectedGiorno, setSelectedGiorno] = useState<string | null>(null);

  // Realtime subscription per admin (tutti i PIN)
  useEffect(() => {
    if (!isAdmin) return;

    const debouncedInvalidate = debounce(() => {
      invalidateStoricoGlobale();
      invalidateTotaliGlobali();
    }, 250);

    const unsubscribe = subscribeTimbrature({
      onChange: (payload) => {
        console.debug('📡 Storico Admin received realtime event:', payload);
        debouncedInvalidate();
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Query per dati dipendente
  const { data: dipendente } = useQuery({
    queryKey: ['utente', pin],
    queryFn: async () => {
      const utenti = await UtentiService.getUtenti();
      return utenti.find(u => u.pin === pin);
    }
  });

  // Query per turni completi via RPC (include tutti i giorni)
  const { 
    data: turniGiornalieri = [], 
    isLoading: isLoadingTimbrature
  } = useQuery({
    queryKey: ['turni-completi', filters],
    queryFn: () => loadTurniFull(filters.pin, filters.dal, filters.al, dipendente?.ore_contrattuali || 8),
    enabled: !!dipendente
  }) as { data: GiornoLogicoDettagliato[], isLoading: boolean };

  // Trasforma in dataset con sotto-righe
  const storicoDataset = useMemo(() => 
    buildStoricoDataset(turniGiornalieri), 
    [turniGiornalieri]
  );

  // Query per timbrature del giorno selezionato (per modale)
  const { data: timbratureGiorno = [] } = useQuery({
    queryKey: ['timbrature-giorno', pin, selectedGiorno],
    queryFn: () => TimbratureService.getTimbratureGiorno(pin, selectedGiorno!),
    enabled: !!selectedGiorno
  });

  // Hook per export
  const { handleExportPDF, handleExportXLS } = useStoricoExport({
    dipendente,
    timbrature: turniGiornalieri,
    filters
  });

  // Hook per mutations
  const { updateMutation, deleteMutation } = useStoricoMutations(
    timbratureGiorno,
    () => setSelectedGiorno(null)
  );

  const handleFiltersChange = (newFilters: { dal: string; al: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEditTimbrature = (giornologico: string) => {
    setSelectedGiorno(giornologico);
  };

  if (!dipendente) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Dipendente non trovato</h2>
            <p className="text-gray-400">PIN {pin} non presente nel sistema</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}
    >
      <div className="w-full max-w-[1200px] flex items-center justify-center h-full">
        <div 
          className="rounded-3xl p-6 shadow-2xl border-2 w-full h-[95vh] overflow-hidden relative flex flex-col gap-4"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: '0 0 50px rgba(231, 116, 240, 0.3)'
          }}
        >
        {/* Header - FISSO */}
        <StoricoHeader
          dipendente={dipendente}
          onExportPDF={handleExportPDF}
          onExportXLS={handleExportXLS}
        />

        {/* Filtri - FISSO */}
        <div className="flex-shrink-0">
          {/* TODO: StoricoFilters component missing */}
        </div>

        {/* Tabella - SCROLLABILE */}
        <div className="flex-1 min-h-0">
          <StoricoTable
            timbrature={turniGiornalieri}
            storicoDataset={storicoDataset}
            filters={{ dal: filters.dal, al: filters.al }}
            oreContrattuali={dipendente.ore_contrattuali}
            onEditTimbrature={handleEditTimbrature}
            isLoading={isLoadingTimbrature}
          />
        </div>

        {/* Modale Modifica */}
        <ModaleTimbrature
          isOpen={!!selectedGiorno}
          onClose={() => setSelectedGiorno(null)}
          giornologico={selectedGiorno || ''}
          timbrature={timbratureGiorno}
          onSave={(updates) => updateMutation.mutateAsync(updates)}
          onDelete={() => deleteMutation.mutateAsync()}
          isLoading={updateMutation.isPending || deleteMutation.isPending}
        />
        </div>
      </div>
    </div>
  );
}

// Hook per gestione export storico timbrature
// reserved: api-internal (non rimuovere senza migrazione)
// import { useState } from 'react';
import { useToast } from './use-toast';
import type { Utente } from '@/services/utenti.service';
import type { TurnoFull } from '@/services/storico/types';
// reserved: api-internal (non rimuovere senza migrazione)
// import { TimbratureService } from '@/services/timbrature.service';
// import { downloadCSV, ExportData } from '@/lib/csv-export';

export interface StoricoExportFilters {
  pin?: number;
  dal: string;
  al: string;
}

interface UseStoricoExportProps {
  dipendente: Utente | undefined;
  timbrature: TurnoFull[];
  filters: { pin: number; dal: string; al: string };
}

export function useStoricoExport({ dipendente, timbrature, filters: _filters }: UseStoricoExportProps) {
  void _filters;
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: 'Export PDF',
      description: 'Funzionalità in sviluppo',
    });
  };

  const handleExportXLS = async () => {
    if (!dipendente || timbrature.length === 0) {
      toast({
        title: 'Nessun dato da esportare',
        description: 'Seleziona un periodo con timbrature',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO(BUSINESS): Implementare export con nuovi dati TurnoGiornaliero
      toast({
        title: 'Export Excel',
        description: 'Funzionalità temporaneamente disabilitata durante migrazione RPC',
        variant: 'default',
      });
    } catch {
      toast({
        title: 'Errore export',
        description: 'Impossibile generare il file Excel',
        variant: 'destructive',
      });
    }
  };

  return {
    handleExportPDF,
    handleExportXLS,
  };
}

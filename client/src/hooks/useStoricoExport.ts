// Hook per gestione export storico timbrature
import { useToast } from '@/hooks/use-toast';
import { TimbratureService } from '@/services/timbrature.service';
import { downloadCSV, ExportData } from '@/lib/export';
import { Utente } from '@/services/utenti.service';
import { TurnoFull } from '@/services/storico.service';

interface UseStoricoExportProps {
  dipendente: Utente | undefined;
  timbrature: TurnoFull[];
  filters: { pin: number; dal: string; al: string };
}

export function useStoricoExport({ dipendente, timbrature, filters }: UseStoricoExportProps) {
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

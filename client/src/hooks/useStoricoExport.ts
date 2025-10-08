// Hook per gestione export storico timbrature
import { useToast } from '@/hooks/use-toast';
import { TimbratureService } from '@/services/timbrature.service';
import { downloadCSV, ExportData } from '@/lib/export';
import { Utente } from '@/services/utenti.service';
import { Timbratura } from '@/lib/time';

interface UseStoricoExportProps {
  dipendente: Utente | undefined;
  timbrature: Timbratura[];
  filters: { pin: number; dal: string; al: string };
}

export function useStoricoExport({ dipendente, timbrature, filters }: UseStoricoExportProps) {
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Funzionalità in sviluppo",
    });
  };

  const handleExportXLS = async () => {
    if (!dipendente || timbrature.length === 0) {
      toast({
        title: "Nessun dato da esportare",
        description: "Seleziona un periodo con timbrature",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calcola statistiche per export
      const stats = await TimbratureService.getStatsPeriodo(filters, dipendente.ore_contrattuali);
      
      const exportData: ExportData = {
        dipendente,
        timbrature,
        periodo: { dal: filters.dal, al: filters.al },
        totali: {
          oreTotali: stats.totaleMensileOre,
          oreExtra: stats.totaleMensileExtra,
          giorniLavorati: stats.giorniLavorati,
          mediaOreGiorno: stats.mediaOreGiorno
        }
      };

      downloadCSV(exportData);
      
      toast({
        title: "Export completato",
        description: "File Excel scaricato con successo",
      });
    } catch {
      toast({
        title: "Errore export",
        description: "Impossibile generare il file Excel",
        variant: "destructive",
      });
    }
  };

  return {
    handleExportPDF,
    handleExportXLS
  };
}

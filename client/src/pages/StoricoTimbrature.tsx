import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, User, Clock } from 'lucide-react';
import { formatDateLocal } from '@/lib/time';
import { TimbratureService } from '@/services/timbrature.service';
import { UtentiService } from '@/services/utenti.service';
import { useStoricoExport } from '@/hooks/useStoricoExport';
import StoricoFilters from '@/components/storico/StoricoFilters';
import StoricoTable from '@/components/storico/StoricoTable';
import ModaleTimbrature from '@/components/storico/ModaleTimbrature';

interface StoricoTimbratureProps {
  pin?: number; // PIN del dipendente da visualizzare
}

export default function StoricoTimbrature({ pin = 71 }: StoricoTimbratureProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Query per dati dipendente
  const { data: dipendente } = useQuery({
    queryKey: ['utente', pin],
    queryFn: async () => {
      const utenti = await UtentiService.getUtenti();
      return utenti.find(u => u.pin === pin);
    }
  });

  // Query per timbrature
  const { 
    data: timbrature = [], 
    isLoading: isLoadingTimbrature
  } = useQuery({
    queryKey: ['timbrature', filters],
    queryFn: () => TimbratureService.getTimbraturePeriodo(filters),
    enabled: !!dipendente
  });

  // Query per timbrature del giorno selezionato (per modale)
  const { data: timbratureGiorno = [] } = useQuery({
    queryKey: ['timbrature-giorno', pin, selectedGiorno],
    queryFn: () => TimbratureService.getTimbratureGiorno(pin, selectedGiorno!),
    enabled: !!selectedGiorno
  });

  // Hook per export (dopo dichiarazione variabili)
  const { handleExportPDF, handleExportXLS } = useStoricoExport({
    dipendente,
    timbrature,
    filters
  });

  // Mutation per aggiornamento timbrature
  const updateMutation = useMutation({
    mutationFn: async (updates: {
      dataEntrata: string;
      oraEntrata: string;
      dataUscita: string;
      oraUscita: string;
    }) => {
      // Trova timbrature esistenti per il giorno
      const entrate = timbratureGiorno.filter(t => t.tipo === 'entrata');
      const uscite = timbratureGiorno.filter(t => t.tipo === 'uscita');
      
      // Aggiorna entrata se esiste
      if (entrate.length > 0) {
        await TimbratureService.updateTimbratura(entrate[0].id, {
          data: updates.dataEntrata,
          ore: updates.oraEntrata + ':00'
        });
      }
      
      // Aggiorna uscita se esiste
      if (uscite.length > 0) {
        await TimbratureService.updateTimbratura(uscite[0].id, {
          data: updates.dataUscita,
          ore: updates.oraUscita + ':00',
          dataEntrata: updates.dataEntrata
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Timbrature aggiornate",
        description: "Le modifiche sono state salvate con successo",
      });
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      setSelectedGiorno(null);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante l'aggiornamento",
        variant: "destructive",
      });
    }
  });

  // Mutation per eliminazione timbrature
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Elimina tutte le timbrature del giorno
      for (const timbratura of timbratureGiorno) {
        await TimbratureService.deleteTimbratura(timbratura.id);
      }
    },
    onSuccess: () => {
      toast({
        title: "Timbrature eliminate",
        description: "Le timbrature del giorno sono state eliminate",
      });
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      setSelectedGiorno(null);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante l'eliminazione",
        variant: "destructive",
      });
    }
  });

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
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full p-4 gap-4">
        {/* Header - FISSO */}
        <div className="bg-gray-800/50 rounded-lg p-6 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-violet-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Storico Timbrature</h1>
                <p className="text-gray-300">
                  <User className="w-4 h-4 inline mr-1" />
                  {dipendente.nome} {dipendente.cognome} (PIN: {dipendente.pin})
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleExportXLS}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Filtri - FISSO */}
        <div className="flex-shrink-0">
          <StoricoFilters
            filters={{ dal: filters.dal, al: filters.al }}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoadingTimbrature}
          />
        </div>

        {/* Tabella - SCROLLABILE */}
        <div className="flex-1 min-h-0">
          <StoricoTable
            timbrature={timbrature}
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
  );
}

import React from 'react';
import { User } from 'lucide-react';
import StoricoHeader from '@/components/storico/StoricoHeader';
import StoricoFilters from '@/components/storico/StoricoFilters';
import StoricoTable from '@/components/storico/StoricoTable';
import ModaleTimbrature from '@/components/storico/ModaleTimbrature';
import { useStoricoTimbrature } from '@/hooks/useStoricoTimbrature';
import { useStoricoMutations } from '@/hooks/useStoricoMutations';

interface StoricoTimbratureProps {
  pin?: number; // PIN del dipendente da visualizzare
}

export default function StoricoTimbrature({ pin }: StoricoTimbratureProps) {
  // Se non c'è PIN, mostra errore
  if (!pin) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">PIN richiesto</h2>
            <p className="text-gray-400">Specificare un PIN valido per visualizzare lo storico</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    dipendente,
    filters,
    selectedGiorno,
    turniGiornalieri,
    storicoDataset,
    storicoDatasetV5,
    timbratureGiorno,
    isLoading,
    handleFiltersChange,
    handleEditTimbrature,
    handleExportPDF,
    handleExportXLS,
    setSelectedGiorno,
  } = useStoricoTimbrature(pin);

  const { deleteMutation, saveFromModal } = useStoricoMutations({
    pin: pin,
    dal: filters.dal,
    al: filters.al,
  }, () => {
    setSelectedGiorno(null);
  });

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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div className="w-full max-w-[1200px] flex items-center justify-center h-full">
        <div
          className="rounded-3xl p-6 border-2 w-full h-[95vh] overflow-hidden relative flex flex-col gap-4"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: 'none',
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
            <StoricoFilters
              filters={{ dal: filters.dal, al: filters.al }}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Tabella - SCROLLABILE */}
          <div className="flex-1 min-h-0">
            <StoricoTable
              timbrature={turniGiornalieri}
              storicoDataset={storicoDataset}
              storicoDatasetV5={storicoDatasetV5}
              filters={{ dal: filters.dal, al: filters.al }}
              oreContrattuali={dipendente.ore_contrattuali}
              onEditTimbrature={handleEditTimbrature}
              isLoading={isLoading}
            />
          </div>

          {/* Modale Modifica */}
          <ModaleTimbrature
            isOpen={!!selectedGiorno}
            onClose={() => setSelectedGiorno(null)}
            giorno_logico={selectedGiorno || ''}
            timbrature={timbratureGiorno}
            dipendente={dipendente}
            onSave={async (updates) => {
              await saveFromModal.mutateAsync(updates);
            }}
            onDelete={async (params) => {
              await deleteMutation.mutateAsync(params);
            }}
            isLoading={saveFromModal.isPending || deleteMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useLocation } from 'wouter';
import { User } from "@/lib/icons";
import AdminLayout from '@/components/admin/layout/AdminLayout';
import StoricoHeader from '@/components/storico/StoricoHeader';
import StoricoFilters from '@/components/storico/StoricoFilters';
import StoricoTable from '@/components/storico/StoricoTable';
import ModaleTimbrature from '@/components/storico/ModaleTimbrature';
import { useStoricoTimbrature } from '@/hooks/useStoricoTimbrature';
import { useStoricoMutations } from '@/hooks/useStoricoMutations';
import type { Utente } from '@/services/utenti.service';

/** Box messaggio centrato (stati PIN mancante / dipendente non trovato). */
function StoricoMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-lg border border-[rgba(122,18,40,0.12)] bg-white/70 p-8 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-[#7A5A64]" />
        <h2 className="mb-2 text-xl font-semibold text-[#1C0A10]">{title}</h2>
        <p className="text-[#7A5A64]">{message}</p>
      </div>
    </div>
  );
}

interface StoricoTimbratureProps {
  pin?: number; // PIN del dipendente da visualizzare
  utenti?: Utente[]; // Dipendenti attivi, per il selettore nell'header
}

export default function StoricoTimbrature({ pin, utenti = [] }: StoricoTimbratureProps) {
  // Se non c'è PIN, mostra errore
  if (!pin) {
    return (
      <AdminLayout title="Storico">
        <StoricoMessage title="PIN richiesto" message="Specificare un PIN valido per visualizzare lo storico" />
      </AdminLayout>
    );
  }

  const [, setLocation] = useLocation();

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
      <AdminLayout title="Storico">
        <StoricoMessage title="Dipendente non trovato" message={`PIN ${pin} non presente nel sistema`} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Storico">
      <div className="flex h-full flex-col gap-1 md:gap-4">
        {/* Header - FISSO */}
        <StoricoHeader
          dipendente={dipendente}
          utenti={utenti}
          onSelectDipendente={(nuovoPin) => setLocation(`/storico-timbrature/${nuovoPin}`)}
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
        <div className="min-h-0 flex-1 p-1">
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
    </AdminLayout>
  );
}

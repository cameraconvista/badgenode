import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronUp } from 'lucide-react';
import { Utente } from '@/services/utenti.service';
import ArchivioActions from './ArchivioActions';
import EmptyState from './EmptyState';

interface ArchivioTableProps {
  utenti: Utente[];
  isLoading: boolean;
  onStorico: (pin: number) => void;
  onModifica: (utente: Utente) => void;
  onArchivia: (id: string) => Promise<void>;
  onElimina: (utente: Utente) => void;
}

export default function ArchivioTable({
  utenti,
  isLoading,
  onStorico,
  onModifica,
  onArchivia,
  onElimina,
}: ArchivioTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Ordina utenti per PIN
  const sortedUtenti = useMemo(() => {
    return [...utenti].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.pin - b.pin;
      } else {
        return b.pin - a.pin;
      }
    });
  }, [utenti, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Caricamento dipendenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabella TableKit Standard */}
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{width: '72px'}} />    {/* Storico (icona grafico) */}
              <col style={{width: '96px'}} />    {/* PIN */}
              <col />                            {/* Nome (auto) */}
              <col />                            {/* Cognome (auto) */}
              <col style={{width: '140px'}} />   {/* Azioni */}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[rgba(255,255,255,0.06)] h-[44px]">
              <tr>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Storico</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center justify-center gap-2 hover:text-white transition-colors w-full"
                  >
                    PIN
                    <ChevronUp
                      className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    />
                  </button>
                </th>
                <th className="px-4 text-left align-middle text-sm font-semibold text-white/90">Nome</th>
                <th className="px-4 text-left align-middle text-sm font-semibold text-white/90">Cognome</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sortedUtenti.length === 0 ? (
                <tr className="bn-row bn-row-dense align-middle">
                  <td colSpan={5} className="bn-cell px-4 text-center py-8">
                    <EmptyState hasSearch={false} searchTerm="" />
                  </td>
                </tr>
              ) : (
                sortedUtenti.map((utente) => (
                  <tr
                    key={utente.id || `pin-${utente.pin}`}
                    className="bn-row bn-row-dense align-middle"
                  >
                    <td className="bn-cell px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(utente.pin)}
                        className="p-2 hover:bg-violet-600/20 text-gray-300 hover:text-white"
                        title={`Storico di ${utente.nome} ${utente.cognome}`}
                      >
                        <BarChart3 className="w-5 h-5" />
                      </Button>
                    </td>
                    <td className="bn-cell px-4 text-center tabular-nums">
                      <span className="font-mono font-medium text-base text-violet-400">
                        {utente.pin.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="bn-cell px-4 text-left">
                      <span className="font-medium text-base text-white">{utente.nome}</span>
                    </td>
                    <td className="bn-cell px-4 text-left">
                      <span className="font-medium text-base text-white">{utente.cognome}</span>
                    </td>
                    <td className="bn-cell px-4">
                      <div className="flex items-center justify-center">
                        <ArchivioActions
                          utente={utente}
                          onModifica={onModifica}
                          onArchivia={onArchivia}
                          onElimina={onElimina}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
      {/* Tabella con header fisso */}
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50 flex-1 flex flex-col">
        {/* Header fisso */}
        <div className="bg-gray-700/80">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 font-medium text-base text-gray-200 w-24">
                  Storico
                </th>
                <th className="text-left p-4 font-medium text-base text-gray-200 w-20">
                  <button 
                    onClick={toggleSortOrder}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    PIN
                    <ChevronUp className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-base text-gray-200 w-40">Nome</th>
                <th className="text-center p-4 font-medium text-base text-gray-200 w-40">Cognome</th>
                <th className="text-center p-4 font-medium text-base text-gray-200 w-28">Azioni</th>
              </tr>
            </thead>
          </table>
        </div>
        
        {/* Body scrollabile */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <tbody>
              {sortedUtenti.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8">
                    <EmptyState hasSearch={false} searchTerm="" />
                  </td>
                </tr>
              ) : (
                sortedUtenti.map((utente) => (
                  <tr key={utente.id} className="border-t border-gray-600 hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 w-24">
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
                    <td className="p-4 w-20">
                      <span className="font-mono font-medium text-base text-violet-400">
                        {utente.pin.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="p-4 w-40">
                      <span className="font-medium text-base text-white">{utente.nome}</span>
                    </td>
                    <td className="p-4 w-40 text-center">
                      <div className="flex justify-center">
                        <span className="font-medium text-base text-white">{utente.cognome}</span>
                      </div>
                    </td>
                    <td className="p-4 w-28">
                      <div className="flex justify-center">
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

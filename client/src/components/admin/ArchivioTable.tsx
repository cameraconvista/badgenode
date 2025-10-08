import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Utente } from '@/services/utenti.service';
import ArchivioActions from './ArchivioActions';
import TableToolbar from './TableToolbar';
import EmptyState from './EmptyState';

interface ArchivioTableProps {
  utenti: Utente[];
  isLoading: boolean;
  onStorico: (pin: number) => void;
  onModifica: (utente: Utente) => void;
  onArchivia: (id: string) => Promise<void>;
  onElimina: (id: string) => Promise<void>;
}

type SortOrder = 'asc' | 'desc';

export default function ArchivioTable({
  utenti,
  isLoading,
  onStorico,
  onModifica,
  onArchivia,
  onElimina,
}: ArchivioTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filtra e ordina utenti
  const filteredAndSortedUtenti = useMemo(() => {
    let filtered = utenti;

    // Filtro per ricerca (nome/cognome)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = utenti.filter(
        (utente) =>
          utente.nome.toLowerCase().includes(search) ||
          utente.cognome.toLowerCase().includes(search)
      );
    }

    // Ordinamento per PIN
    filtered.sort((a, b) => {
      return sortOrder === 'asc' ? a.pin - b.pin : b.pin - a.pin;
    });

    return filtered;
  }, [utenti, searchTerm, sortOrder]);

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
    <div className="space-y-4">
      {/* Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortToggle={toggleSortOrder}
      />

      {/* Tabella */}
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header sticky */}
            <thead className="bg-gray-700/80 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 font-medium text-sm text-gray-200">📊 Storico</th>
                <th className="text-left p-3 font-medium text-sm text-gray-200">PIN</th>
                <th className="text-left p-3 font-medium text-sm text-gray-200">Nome</th>
                <th className="text-left p-3 font-medium text-sm text-gray-200">Cognome</th>
                <th className="text-center p-3 font-medium text-sm text-gray-200">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUtenti.length === 0 ? (
                <EmptyState hasSearch={!!searchTerm} searchTerm={searchTerm} />
              ) : (
                filteredAndSortedUtenti.map((utente) => (
                  <tr key={utente.id} className="border-t border-gray-600 hover:bg-gray-700/50 transition-colors">
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(utente.pin)}
                        className="p-2 hover:bg-violet-600/20 text-gray-300"
                        title={`Storico di ${utente.nome} ${utente.cognome}`}
                      >
                        📊
                      </Button>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-medium text-violet-400">
                        {utente.pin.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-white">{utente.nome}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-white">{utente.cognome}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <ArchivioActions
                          utente={utente}
                          onStorico={onStorico}
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

      {/* Info risultati */}
      {filteredAndSortedUtenti.length > 0 && (
        <div className="text-sm text-gray-400 text-center">
          {searchTerm ? (
            <>
              Trovati <strong className="text-violet-400">{filteredAndSortedUtenti.length}</strong> dipendenti su{' '}
              <strong className="text-violet-400">{utenti.length}</strong> totali
            </>
          ) : (
            <>
              <strong className="text-violet-400">{utenti.length}</strong> dipendenti attivi
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dipendenti...</p>
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
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header sticky */}
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-4 font-medium text-sm">📊 Storico</th>
                <th className="text-left p-4 font-medium text-sm">PIN</th>
                <th className="text-left p-4 font-medium text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-sm">Cognome</th>
                <th className="text-center p-4 font-medium text-sm">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUtenti.length === 0 ? (
                <EmptyState hasSearch={!!searchTerm} searchTerm={searchTerm} />
              ) : (
                filteredAndSortedUtenti.map((utente) => (
                  <tr key={utente.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(utente.pin)}
                        className="p-2 hover:bg-accent/10"
                        title={`Storico di ${utente.nome} ${utente.cognome}`}
                      >
                        📊
                      </Button>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-medium text-primary">
                        {utente.pin.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{utente.nome}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{utente.cognome}</span>
                    </td>
                    <td className="p-4">
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
        <div className="text-sm text-muted-foreground text-center">
          {searchTerm ? (
            <>
              Trovati <strong>{filteredAndSortedUtenti.length}</strong> dipendenti su{' '}
              <strong>{utenti.length}</strong> totali
            </>
          ) : (
            <>
              <strong>{utenti.length}</strong> dipendenti attivi
            </>
          )}
        </div>
      )}
    </div>
  );
}

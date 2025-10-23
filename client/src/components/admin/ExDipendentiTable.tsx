import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { History, Users, AlertCircle } from 'lucide-react';
import EmptyState from './EmptyState';
import { ExDipendente } from '@/services/utenti.service';

interface ExDipendentiTableProps {
  exDipendenti: ExDipendente[];
  isLoading: boolean;
  isError?: boolean;
  onStorico: (pin: number) => void;
  onRipristina?: (exDipendente: ExDipendente) => void;
  onElimina?: (exDipendente: ExDipendente) => void;
}

export default function ExDipendentiTable({
  exDipendenti,
  isLoading,
  isError,
  onStorico,
  onRipristina,
  onElimina,
}: ExDipendentiTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Più recenti prima

  // Ordina ex-dipendenti per data archiviazione
  const sortedExDipendenti = useMemo(() => {
    return [...exDipendenti].sort((a, b) => {
      const dateA = new Date(a.archiviato_il).getTime();
      const dateB = new Date(b.archiviato_il).getTime();
      
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [exDipendenti, sortOrder]);

  const _toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  void _toggleSortOrder;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Caricamento ex-dipendenti...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Errore di caricamento
          </h3>
          <p className="text-gray-400 text-sm">
            Impossibile caricare gli ex-dipendenti
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabella TableKit Standard */}
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full table-fixed border-collapse bn-archivio bn-nohover">
            <colgroup>
              {[
                <col key="st" style={{ width: "88px" }} />,
                <col key="nm" style={{ width: "24%" }} />,
                <col key="cg" style={{ width: "24%" }} />,
                <col key="dt" style={{ width: "160px" }} />,
                <col key="az" style={{ width: "180px" }} />,
              ]}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[rgba(255,255,255,0.06)] h-[48px]">
              <tr>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Storico</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Nome</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Cognome</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Data Archiviazione</th>
                <th className="px-4 text-center align-middle text-sm font-semibold text-white/90">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sortedExDipendenti.length === 0 ? (
                <tr className="bn-row bn-row-dense align-middle">
                  <td colSpan={5} className="bn-cell px-4 text-center py-8">
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-300 mb-2">
                        Nessun ex-dipendente
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Gli ex-dipendenti archiviati appariranno qui
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedExDipendenti.map((exDipendente) => (
                  <tr
                    key={String(exDipendente.pin ?? '') || `arch-${exDipendente.archiviato_il}`}
                    className="bn-row bn-row-tall align-middle"
                  >
                    <td className="bn-cell px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(exDipendente.pin)}
                        className="p-2"
                        title={`Storico di ${exDipendente.nome} ${exDipendente.cognome}`}
                      >
                        <History className="icon-storico" aria-label="Storico" />
                      </Button>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-white">{exDipendente.nome}</span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-white">{exDipendente.cognome}</span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-sm text-gray-300">
                        {new Date(exDipendente.archiviato_il).toLocaleDateString('it-IT')}
                      </span>
                    </td>
                    <td className="bn-cell px-4">
                      <div className="bn-actions flex items-center justify-end gap-3 flex-wrap">
                        {onRipristina && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRipristina(exDipendente)}
                            className="p-2"
                            title={`Ripristina ${exDipendente.nome} ${exDipendente.cognome}`}
                          >
                            {/* Riusa icone di sistema, mantenendo stile */}
                            <span className="text-green-400 text-sm font-semibold">Ripristina</span>
                          </Button>
                        )}
                        {onElimina && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onElimina(exDipendente)}
                            className="p-2"
                            title={`Elimina definitivamente ${exDipendente.nome} ${exDipendente.cognome}`}
                          >
                            <span className="text-red-400 text-sm font-semibold">Elimina</span>
                          </Button>
                        )}
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

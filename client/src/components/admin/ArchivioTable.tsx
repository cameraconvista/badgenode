import { Button } from '@/components/ui/button';
import { History } from "@/lib/icons";
import { Utente } from '@/services/utenti.service';
import ArchivioActions from './ArchivioActions';
import EmptyState from './EmptyState';
import { useSortableTable, SortableHeader } from './useSortableTable';

type ArchivioSortKey = 'pin' | 'nome' | 'cognome';

// Valore ordinabile per colonna: PIN numerico, nome/cognome come stringa.
const getArchivioValue = (u: Utente, key: ArchivioSortKey): string | number =>
  key === 'pin' ? u.pin : (u[key] ?? '');

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
  // Ordinamento condiviso (default: PIN crescente).
  const { sorted: sortedUtenti, toggle } = useSortableTable<Utente, ArchivioSortKey>(
    utenti,
    getArchivioValue,
    { key: 'pin', direction: 'asc' },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1228] mx-auto mb-4"></div>
          <p className="text-[#7A5A64]">Caricamento dipendenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Guscio tabella con ombreggiatura coerente allo Storico (bn-table-shell). */}
      <div className="bn-table-shell">
          <div className="flex-1 overflow-auto overscroll-contain">
          <table className="w-full min-w-[400px] sm:min-w-[640px] table-fixed border-collapse bn-archivio bn-nohover archivio-table">
            <colgroup>
              {[
                <col key="st" style={{ width: "88px" }} />,
                <col key="pin" style={{ width: "112px" }} />,
                <col key="nm" style={{ width: "28%" }} />,
                <col key="cg" style={{ width: "28%" }} />,
                <col key="az" style={{ width: "160px" }} />,
              ]}
            </colgroup>
            <thead className="bn-sticky-head">
              <tr>
                <th className="bn-table__header-cell">Storico</th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="PIN" columnKey="pin" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="Nome" columnKey="nome" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="Cognome" columnKey="cognome" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">Azioni</th>
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
                    className="bn-row bn-row-archivio-compact align-middle"
                  >
                    <td className="bn-cell px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(utente.pin)}
                        className="p-1 no-default-hover-elevate no-default-active-elevate"
                        title={`Storico di ${utente.nome} ${utente.cognome}`}
                      >
                        <History className="icon-storico" aria-label="Storico" />
                      </Button>
                    </td>
                    <td className="bn-cell px-4 text-center tabular-nums">
                      <span className="font-mono font-medium text-base text-[#7A1228]">
                        {utente.pin.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-[#1C0A10]">{utente.nome}</span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-[#1C0A10]">{utente.cognome}</span>
                    </td>
                    <td className="bn-cell px-4">
                      <div className="bn-actions flex items-center justify-center gap-3">
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

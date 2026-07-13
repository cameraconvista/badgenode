import { Button } from '@/components/ui/button';
import { History, Users, AlertCircle, RotateCcw, Trash2 } from "@/lib/icons";
import { ExDipendente } from '@/services/utenti.service';
import { formatDataGiornoMeseAnno } from '@/lib/time';
import { useSortableTable, SortableHeader } from './useSortableTable';

type ExSortKey = 'nome' | 'cognome' | 'archiviato_il';

// Valore ordinabile: nome/cognome come stringa, archiviazione come timestamp.
const getExValue = (u: ExDipendente, key: ExSortKey): string | number =>
  key === 'archiviato_il' ? new Date(u.archiviato_il).getTime() : (u[key] ?? '');

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
  // Ordinamento condiviso (default: archiviazione più recente prima).
  const { sorted: sortedExDipendenti, toggle } = useSortableTable<ExDipendente, ExSortKey>(
    exDipendenti,
    getExValue,
    { key: 'archiviato_il', direction: 'desc' },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1228] mx-auto mb-4"></div>
          <p className="text-[#7A5A64]">Caricamento ex-dipendenti...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-medium text-[#7A5A64] mb-2">
            Errore di caricamento
          </h3>
          <p className="text-[#7A5A64] text-sm">
            Impossibile caricare gli ex-dipendenti
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Guscio tabella con ombreggiatura coerente allo Storico (bn-table-shell). */}
      <div className="bn-table-shell">
          <div className="flex-1 overflow-auto overscroll-contain">
          <table className="w-full min-w-[680px] table-fixed border-collapse bn-archivio bn-nohover exdip-table">
            <colgroup>
              {[
                <col key="st" style={{ width: "88px" }} />,
                <col key="nm" style={{ width: "24%" }} />,
                <col key="cg" style={{ width: "24%" }} />,
                <col key="dt" style={{ width: "160px" }} />,
                <col key="az" style={{ width: "180px" }} />,
              ]}
            </colgroup>
            <thead className="bn-sticky-head">
              <tr>
                <th className="bn-table__header-cell">Storico</th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="Nome" columnKey="nome" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="Cognome" columnKey="cognome" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">
                  <SortableHeader label="Archiviazione" columnKey="archiviato_il" onSort={toggle} />
                </th>
                <th className="bn-table__header-cell">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sortedExDipendenti.length === 0 ? (
                <tr className="bn-row bn-row-dense align-middle">
                  <td colSpan={5} className="bn-cell px-4 text-center py-8">
                    <div className="text-center py-8">
                      <div className="text-[#7A5A64] mb-2">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-[#7A5A64] mb-2">
                        Nessun ex-dipendente
                      </h3>
                      <p className="text-[#7A5A64] text-sm">
                        Gli ex-dipendenti archiviati appariranno qui
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedExDipendenti.map((exDipendente) => (
                  <tr
                    key={String(exDipendente.pin ?? '') || `arch-${exDipendente.archiviato_il}`}
                    className="bn-row bn-row-archivio-compact align-middle"
                  >
                    <td className="bn-cell px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStorico(exDipendente.pin)}
                        className="p-1 no-default-hover-elevate no-default-active-elevate"
                        title={`Storico di ${exDipendente.nome} ${exDipendente.cognome}`}
                      >
                        <History className="icon-storico" aria-label="Storico" />
                      </Button>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-[#1C0A10]">{exDipendente.nome}</span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="font-medium text-base text-[#1C0A10]">{exDipendente.cognome}</span>
                    </td>
                    <td className="bn-cell px-4 text-center">
                      <span className="bn-date-cell text-sm text-[#7A5A64]">
                        {formatDataGiornoMeseAnno(exDipendente.archiviato_il)}
                      </span>
                    </td>
                    <td className="bn-cell px-4">
                      <div className="bn-actions flex items-center justify-center gap-3">
                        {onRipristina && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRipristina(exDipendente)}
                            className="p-1 no-default-hover-elevate no-default-active-elevate"
                            title={`Ripristina ${exDipendente.nome} ${exDipendente.cognome}`}
                          >
                            <RotateCcw className="icon-action text-[#3E7D52] hover:text-[#4A9061]" aria-label="Ripristina" />
                          </Button>
                        )}
                        {onElimina && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onElimina(exDipendente)}
                            className="p-1 no-default-hover-elevate no-default-active-elevate"
                            title={`Elimina definitivamente ${exDipendente.nome} ${exDipendente.cognome}`}
                          >
                            <Trash2 className="icon-action text-red-600 hover:text-red-700" aria-label="Elimina" />
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

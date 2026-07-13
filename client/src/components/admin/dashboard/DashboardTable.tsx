import { Users, AlertCircle } from '@/lib/icons';
import { formatOre } from '@/lib/time';
import { useSortableTable, SortableHeader } from '../useSortableTable';
import type { DashboardRow } from '@/hooks/useDashboardTotals';

type DashSortKey = 'pin' | 'nome' | 'cognome' | 'totaleOre' | 'totaleExtra';

// Valore ordinabile: PIN/ore/extra numerici, nome/cognome come stringa.
const getDashValue = (r: DashboardRow, key: DashSortKey): string | number =>
  key === 'nome' || key === 'cognome' ? (r[key] ?? '') : r[key];

interface DashboardTableProps {
  rows: DashboardRow[];
  totali: { totaleOre: number; totaleExtra: number };
  isLoading: boolean;
  isError?: boolean;
}

export default function DashboardTable({ rows, totali, isLoading, isError }: DashboardTableProps) {
  // Ordinamento condiviso (default: PIN crescente), stesso hook delle altre tabelle.
  const { sorted, toggle } = useSortableTable<DashboardRow, DashSortKey>(rows, getDashValue, {
    key: 'pin',
    direction: 'asc',
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-medium text-[#7A5A64] mb-2">Errore di caricamento</h3>
          <p className="text-[#7A5A64] text-sm">Impossibile caricare i totali dei dipendenti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-1">
      {/* Wrapper ombra: rounded + shadow senza overflow-hidden (angoli rispettati). */}
      <div className="flex-1 flex flex-col rounded-xl shadow-[0_12px_28px_-6px_rgba(122,18,40,0.30)]">
        <div className="border border-[rgba(122,18,40,0.15)] rounded-xl overflow-hidden bg-white flex-1 flex flex-col">
          <div className="flex-1 overflow-auto overscroll-contain">
            <table className="w-full min-w-[640px] table-fixed border-collapse bn-archivio bn-nohover archivio-table">
              <colgroup>
                {[
                  <col key="pin" style={{ width: '96px' }} />,
                  <col key="nm" style={{ width: '26%' }} />,
                  <col key="cg" style={{ width: '26%' }} />,
                  <col key="ore" style={{ width: '20%' }} />,
                  <col key="ex" style={{ width: '20%' }} />,
                ]}
              </colgroup>
              <thead className="bn-sticky-head">
                <tr>
                  <th className="bn-table__header-cell">
                    <SortableHeader label="PIN" columnKey="pin" onSort={toggle} />
                  </th>
                  <th className="bn-table__header-cell">
                    <SortableHeader label="Nome" columnKey="nome" onSort={toggle} />
                  </th>
                  <th className="bn-table__header-cell">
                    <SortableHeader label="Cognome" columnKey="cognome" onSort={toggle} />
                  </th>
                  <th className="bn-table__header-cell">Ore</th>
                  <th className="bn-table__header-cell">Extra</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr className="bn-row bn-row-dense align-middle">
                    <td colSpan={5} className="bn-cell px-4 text-center py-8">
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50 text-[#7A5A64]" />
                        <h3 className="text-lg font-medium text-[#7A5A64] mb-2">Nessun dipendente</h3>
                        <p className="text-[#7A5A64] text-sm">
                          {isLoading ? 'Caricamento in corso…' : 'Nessun dato per il periodo selezionato'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((r) => (
                    <tr key={`dash-${r.pin}`} className="bn-row bn-row-archivio-compact align-middle">
                      <td className="bn-cell px-4 text-center tabular-nums">
                        <span className="font-mono font-medium text-base text-[#7A1228]">
                          {r.pin.toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="bn-cell px-4 text-center">
                        <span className="font-medium text-base text-[#1C0A10]">{r.nome}</span>
                      </td>
                      <td className="bn-cell px-4 text-center">
                        <span className="font-medium text-base text-[#1C0A10]">{r.cognome}</span>
                      </td>
                      <td className="bn-cell px-4 text-center tabular-nums">
                        <span className="font-semibold text-base text-[#1C0A10]">{formatOre(r.totaleOre)}</span>
                      </td>
                      <td className="bn-cell px-4 text-center tabular-nums">
                        <span className="font-semibold text-base text-[#1C0A10]">
                          {r.totaleExtra > 0 ? formatOre(r.totaleExtra) : '0.00'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Barra totali: stesse colonne della tabella → i valori cadono sotto Ore/Extra. */}
          <div className="bn-totals-solid border-t border-[rgba(255,255,255,0.15)]">
            <table className="w-full min-w-[640px] table-fixed border-collapse">
              <colgroup>
                {[
                  <col key="pin" style={{ width: '96px' }} />,
                  <col key="nm" style={{ width: '26%' }} />,
                  <col key="cg" style={{ width: '26%' }} />,
                  <col key="ore" style={{ width: '20%' }} />,
                  <col key="ex" style={{ width: '20%' }} />,
                ]}
              </colgroup>
              <tbody>
                <tr>
                  {/* PIN + Nome → conteggio dipendenti */}
                  <td className="px-4 py-2.5 text-left" colSpan={2}>
                    <span className="inline-flex items-baseline gap-2">
                      <span className="text-white/80 font-semibold text-sm">Dipendenti</span>
                      <span className="text-white font-bold text-lg tabular-nums">{rows.length}</span>
                    </span>
                  </td>
                  {/* Cognome → etichetta "Totali" a ridosso della colonna Ore (come Storico) */}
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-white/80 font-semibold text-sm">Totali</span>
                  </td>
                  {/* Ore → totale ore */}
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-white font-bold text-lg tabular-nums">{formatOre(totali.totaleOre)}</span>
                  </td>
                  {/* Extra → totale extra */}
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-white font-bold text-lg tabular-nums">
                      {totali.totaleExtra > 0 ? formatOre(totali.totaleExtra) : '0.00'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

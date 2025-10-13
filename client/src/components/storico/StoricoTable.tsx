import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatOre, formatDataEstesa, getMeseItaliano } from '@/lib/time';
import {
  formatTimeOrDash,
  calcolaTotaliV5,
  StoricoDatasetV5,
} from '@/services/storico.service';
import { StoricoRowData, GiornoLogicoDettagliato, SessioneTimbratura } from '@/lib/storico/types';
import StoricoTotalsBar from './StoricoTotalsBar';
import ColGroupStorico from './ColGroupStorico';

interface StoricoTableProps {
  timbrature: GiornoLogicoDettagliato[]; // Legacy (per compatibilità)
  storicoDataset: StoricoRowData[]; // Dataset con sotto-righe
  storicoDatasetV5: StoricoDatasetV5[]; // NUOVO: Dataset v5 per totali
  filters: { dal: string; al: string };
  oreContrattuali: number;
  onEditTimbrature: (giornologico: string) => void;
  isLoading?: boolean;
}

export default function StoricoTable({
  timbrature: _timbrature,
  storicoDataset, // Dataset con sotto-righe
  storicoDatasetV5, // NUOVO: Dataset v5 per totali
  filters: _filters,
  oreContrattuali: _oreContrattuali,
  onEditTimbrature,
  isLoading,
}: StoricoTableProps) {
  void _timbrature; void _filters; void _oreContrattuali;
  // Calcola totali dal dataset v5 (fonte unica di verità) con protezione
  const list = Array.isArray(storicoDatasetV5) ? storicoDatasetV5 : [];
  const { totaleOre: totaleMensileOre, totaleExtra: totaleMensileExtra } = calcolaTotaliV5(list);
  const giorniLavorati = list.filter(d => d.ore_totali_chiuse > 0).length;

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <span className="text-gray-300">Caricamento storico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bn-table__container">
      {/* Tabella HTML Standard */}
      <div className="bn-table__scroll-area">
        <table className="bn-table__table">
          {/* Definizione larghezze colonne - unica fonte di verità */}
          <ColGroupStorico />
          
          {/* Header fisso */}
          <thead className="bn-table__header">
            <tr>
              <th className="bn-table__header-cell bn-table__header-cell--left">Data</th>
              <th className="bn-table__header-cell">Mese</th>
              <th className="bn-table__header-cell">Entrata</th>
              <th className="bn-table__header-cell">Uscita</th>
              <th className="bn-table__header-cell tabular-nums">Ore</th>
              <th className="bn-table__header-cell tabular-nums">Extra</th>
              <th className="bn-table__header-cell">Modifica</th>
            </tr>
          </thead>

          {/* Body scrollabile */}
          <tbody>
            {storicoDataset.map((row, _index) => {
              if (row.type === 'giorno') {
                return renderRigaGiorno(row.giorno!, _index);
              } else {
                return renderRigaSessione(row.sessione!, row.giornoParent!, _index);
              }
            })}
          </tbody>
        </table>
      </div>

      {/* Footer fisso - Totali Mensili */}
      <StoricoTotalsBar
        totaleMensileOre={totaleMensileOre}
        totaleMensileExtra={totaleMensileExtra}
        giorniLavorati={giorniLavorati}
      />
    </div>
  );

  // Funzione render riga giorno (convertita a HTML table)
  function renderRigaGiorno(giorno: GiornoLogicoDettagliato, index: number) {
    // Determina se è weekend (sabato=6, domenica=0)
    const date = new Date(giorno.giorno);
    const weekday = date.getDay();
    const isWeekendDay = weekday === 6 || weekday === 0; // sab=6, dom=0
    
    return (
      <tr
        key={`giorno-${giorno.giorno}`}
        className={`
          ${isWeekendDay ? 'bn-row bn-row--weekend bn-row-dense' : 'bn-row bn-row-dense'}
          ${giorno.ore > 0 ? 'has-timbrature' : ''}
          ${giorno.ore === 0 ? 'opacity-60' : ''}
          text-base
        `}
      >
        {/* Data */}
        <td className="bn-table__cell bn-table__cell--left bn-cell text-sm">
          <span className="font-medium">
            {formatDataEstesa(giorno.giorno)}
          </span>
        </td>

        {/* Mese */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="font-medium">
            {getMeseItaliano(giorno.giorno)}
          </span>
        </td>

        {/* Entrata */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="font-medium">
            {formatTimeOrDash(giorno.entrata)}
          </span>
        </td>

        {/* Uscita */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="font-medium">
            {formatTimeOrDash(giorno.uscita)}
          </span>
        </td>

        {/* Ore Lavorate */}
        <td className="bn-table__cell bn-cell text-sm tabular-nums">
          <span className="font-medium">
            {formatOre(giorno.ore)}
          </span>
        </td>

        {/* Ore Extra */}
        <td className="bn-table__cell bn-cell text-sm tabular-nums">
          {giorno.extra > 0 ? (
            <span className="text-yellow-400 font-bold">{formatOre(giorno.extra)}</span>
          ) : (
            <span>—</span>
          )}
        </td>

        {/* Modifica */}
        <td className="bn-table__cell bn-cell">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditTimbrature(giorno.giorno)}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <Edit className="h-4 w-4 text-yellow-400 hover:text-yellow-300 transition-colors" />
          </Button>
        </td>
      </tr>
    );
  }

  // Funzione render riga sessione (convertita a HTML table)
  function renderRigaSessione(sessione: SessioneTimbratura, giornoParent: string, index: number) {
    return (
      <tr
        key={`${giornoParent}-${sessione.numeroSessione}-${sessione.entrata || 'no-entrata'}-${sessione.uscita || 'open'}`}
        className="bn-table__row--session text-sm"
      >
        {/* Data - vuota */}
        <td className="bn-table__cell bn-table__cell--left bn-cell"></td>

        {/* Mese - indicatore sessione (solo dalla #2 in poi) */}
        <td className="bn-table__cell bn-cell text-xs">
          <span className="text-gray-400">
            {sessione.numeroSessione >= 2 ? `#${sessione.numeroSessione}` : ''}
          </span>
        </td>

        {/* Entrata sessione */}
        <td className="bn-table__cell bn-cell">
          <span className="text-white/70">{formatTimeOrDash(sessione.entrata)}</span>
        </td>

        {/* Uscita sessione */}
        <td className="bn-table__cell bn-cell">
          <span className="text-white/70">
            {sessione.isAperta ? '—' : formatTimeOrDash(sessione.uscita)}
          </span>
        </td>

        {/* Ore sessione */}
        <td className="bn-table__cell bn-cell tabular-nums">
          <span className="text-white/70">{formatOre(sessione.ore)}</span>
        </td>

        {/* Extra - vuoto per sessioni */}
        <td className="bn-table__cell bn-cell"></td>

        {/* Modifica - vuoto per sessioni */}
        <td className="bn-table__cell bn-cell"></td>
      </tr>
    );
  }
}

/*
ESEMPIO UTILIZZO formatCreatedAt per timestamp:

Per mostrare created_at in formato HH:MM:SS (senza millisecondi):
{formatCreatedAt(row.created_at)}

Equivalente a:
{new Date(row.created_at).toLocaleTimeString('it-IT', { hour12: false, timeStyle: 'medium' })}
*/

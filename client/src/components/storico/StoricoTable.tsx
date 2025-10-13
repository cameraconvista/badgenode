import { Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatOre, formatDataBreve, formatDataEstesa, getMeseItaliano, formatCreatedAt, isWeekend } from '@/lib/time';
import {
  TurnoFull,
  formatTimeOrDash,
  calcolaTotaliV5,
  StoricoDatasetV5,
} from '@/services/storico.service';
import { StoricoRowData, GiornoLogicoDettagliato, SessioneTimbratura } from '@/lib/storico/types';
import StoricoTotalsBar from './StoricoTotalsBar';

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
  timbrature, // Legacy (per compatibilità)
  storicoDataset, // Dataset con sotto-righe
  storicoDatasetV5, // NUOVO: Dataset v5 per totali
  filters,
  oreContrattuali,
  onEditTimbrature,
  isLoading,
}: StoricoTableProps) {
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
    <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden shadow-lg">
      {/* Tabella HTML Standard */}
      <div className="flex-1 overflow-y-auto">
        <table className="table-fixed w-full border-collapse">
          {/* Definizione larghezze colonne */}
          <colgroup>
            <col className="w-28" /> {/* Data - ridotta leggermente */}
            <col className="w-28" /> {/* Mese - aumentata per equilibrio */}
            <col className="w-20" /> {/* Entrata */}
            <col className="w-20" /> {/* Uscita */}
            <col className="w-16" /> {/* Ore */}
            <col className="w-16" /> {/* Extra */}
            <col className="w-12" /> {/* Modifica - più stretta */}
          </colgroup>
          
          {/* Header fisso */}
          <thead className="bg-gray-700 border-b border-gray-600 sticky top-0 z-10">
            <tr className="h-11">
              <th className="px-4 text-left text-white font-semibold text-base align-middle border-r border-gray-600/30">Data</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle border-r border-gray-600/30">Mese</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle border-r border-gray-600/30">Entrata</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle border-r border-gray-600/30">Uscita</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle border-r border-gray-600/30 tabular-nums">Ore</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle border-r border-gray-600/30 tabular-nums">Extra</th>
              <th className="px-4 text-center text-white font-semibold text-base align-middle">Modifica</th>
            </tr>
          </thead>

          {/* Body scrollabile */}
          <tbody>
            {storicoDataset.map((row, index) => {
              if (row.type === 'giorno') {
                return renderRigaGiorno(row.giorno!, index);
              } else {
                return renderRigaSessione(row.sessione!, row.giornoParent!, index);
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
    const isWeekendDay = isWeekend(giorno.giorno);
    
    return (
      <tr
        key={`giorno-${giorno.giorno}`}
        className={`
          h-11 border-b border-gray-300/50 text-base
          ${isWeekendDay ? 'bg-gray-100' : 'bg-white'}
          ${giorno.ore === 0 ? 'opacity-60' : ''}
          hover:bg-gray-50 transition-colors
        `}
      >
        {/* Data */}
        <td className="px-4 text-left align-middle border-r border-gray-300/30 text-sm">
          <span className={`font-medium ${giorno.ore === 0 ? "text-gray-400" : "text-gray-800"}`}>
            {formatDataEstesa(giorno.giorno)}
          </span>
        </td>

        {/* Mese */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-sm">
          <span className={`font-medium ${giorno.ore === 0 ? "text-gray-400" : "text-gray-800"}`}>
            {getMeseItaliano(giorno.giorno)}
          </span>
        </td>

        {/* Entrata */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-sm">
          <span className={giorno.ore === 0 ? "text-gray-400" : "text-gray-800 font-medium"}>
            {formatTimeOrDash(giorno.entrata)}
          </span>
        </td>

        {/* Uscita */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-sm">
          <span className={giorno.ore === 0 ? "text-gray-400" : "text-gray-800 font-medium"}>
            {formatTimeOrDash(giorno.uscita)}
          </span>
        </td>

        {/* Ore Lavorate */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-sm tabular-nums">
          <span className={giorno.ore === 0 ? "text-gray-400" : "text-gray-800 font-medium"}>
            {formatOre(giorno.ore)}
          </span>
        </td>

        {/* Ore Extra */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-sm tabular-nums">
          {giorno.extra > 0 ? (
            <span className="text-orange-600 font-bold">{formatOre(giorno.extra)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

        {/* Modifica */}
        <td className="px-2 text-center align-middle">
          {giorno.ore > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTimbrature(giorno.giorno)}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-100 h-7 w-7 p-0 flex items-center justify-center mx-auto"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
      </tr>
    );
  }

  // Funzione render riga sessione (convertita a HTML table)
  function renderRigaSessione(sessione: SessioneTimbratura, giornoParent: string, index: number) {
    return (
      <tr
        key={`${giornoParent}-${sessione.numeroSessione}-${sessione.entrata || 'no-entrata'}-${sessione.uscita || 'open'}`}
        className="h-11 border-b border-gray-300/30 text-sm bg-white"
      >
        {/* Data - vuota */}
        <td className="px-4 text-left align-middle border-r border-gray-300/30"></td>

        {/* Mese - indicatore sessione (solo dalla #2 in poi) */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 text-xs">
          <span className="text-gray-500">
            {sessione.numeroSessione >= 2 ? `#${sessione.numeroSessione}` : ''}
          </span>
        </td>

        {/* Entrata sessione */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30">
          <span className="text-gray-600">{formatTimeOrDash(sessione.entrata)}</span>
        </td>

        {/* Uscita sessione */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30">
          <span className="text-gray-600">
            {sessione.isAperta ? '—' : formatTimeOrDash(sessione.uscita)}
          </span>
        </td>

        {/* Ore sessione */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30 tabular-nums">
          <span className="text-gray-600">{formatOre(sessione.ore)}</span>
        </td>

        {/* Extra - vuoto per sessioni */}
        <td className="px-4 text-center align-middle border-r border-gray-300/30"></td>

        {/* Modifica - vuoto per sessioni */}
        <td className="px-4 text-center align-middle"></td>
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

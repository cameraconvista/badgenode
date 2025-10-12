import { Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  formatOre,
  formatDataBreve,
  getMeseItaliano,
  formatCreatedAt
} from '@/lib/time';
import { TurnoFull, formatTimeOrDash, calcolaTotaliV5, StoricoDatasetV5 } from '@/services/storico.service';
import { StoricoRowData, GiornoLogicoDettagliato, SessioneTimbratura } from '@/lib/storico/types';
import StoricoTotalsBar from './StoricoTotalsBar';

interface StoricoTableProps {
  timbrature: GiornoLogicoDettagliato[];     // Legacy (per compatibilità)
  storicoDataset: StoricoRowData[];          // Dataset con sotto-righe
  storicoDatasetV5: StoricoDatasetV5[];      // NUOVO: Dataset v5 per totali
  filters: { dal: string; al: string };
  oreContrattuali: number;
  onEditTimbrature: (giornologico: string) => void;
  isLoading?: boolean;
}

export default function StoricoTable({ 
  timbrature,           // Legacy (per compatibilità)
  storicoDataset,       // Dataset con sotto-righe
  storicoDatasetV5,     // NUOVO: Dataset v5 per totali
  filters, 
  oreContrattuali, 
  onEditTimbrature, 
  isLoading 
}: StoricoTableProps) {
  
  // Calcola totali dal dataset v5 (fonte unica di verità) con protezione
  const list = Array.isArray(storicoDatasetV5) ? storicoDatasetV5 : [];
  const { totaleOre: totaleMensileOre, totaleExtra: totaleMensileExtra } = calcolaTotaliV5(list);
  const giorniLavorati = list.length;

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
    <div className="bg-gray-800/50 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header fisso */}
      <div className="bg-gray-700/50 border-b border-gray-600 flex-shrink-0">
        <div className="grid grid-cols-7 gap-4 p-4 text-white font-semibold text-base">
          <div className="px-0">Data</div>
          <div className="px-0">Mese</div>
          <div className="text-center px-0">Entrata</div>
          <div className="text-center px-0">Uscita</div>
          <div className="text-center tabular-nums px-0">Ore</div>
          <div className="text-right tabular-nums px-0">Extra</div>
          <div className="text-center px-0">Modifica</div>
        </div>
      </div>
      
      {/* Body scrollabile */}
      <div className="flex-1 overflow-y-auto">
        {storicoDataset.map((row, index) => {
          if (row.type === 'giorno') {
            return renderRigaGiorno(row.giorno!, index);
          } else {
            return renderRigaSessione(row.sessione!, row.giornoParent!, index);
          }
        })}
      </div>
      
      {/* Footer fisso - Totali Mensili */}
      <StoricoTotalsBar
        totaleMensileOre={totaleMensileOre}
        totaleMensileExtra={totaleMensileExtra}
        giorniLavorati={giorniLavorati}
      />
    </div>
  );

  // Funzione render riga giorno (logica esistente)
  function renderRigaGiorno(giorno: GiornoLogicoDettagliato, index: number) {
    return (
      <div 
        key={`giorno-${giorno.giorno}`}
        className={`
          grid grid-cols-7 gap-4 p-4 border-b border-gray-600/50 text-base
          ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/30'}
          ${giorno.ore === 0 ? 'opacity-60' : ''}
          hover:bg-gray-600/30 transition-colors
        `}
      >
        {/* Data */}
        <div className="font-medium text-white/90 flex items-center px-0 text-sm">
          {formatDataBreve(giorno.giorno)}
        </div>
        
        {/* Mese */}
        <div className="text-white/90 font-medium px-0 text-sm">
          {getMeseItaliano(giorno.giorno)}
        </div>
        
        {/* Entrata */}
        <div className="text-center px-0 text-sm">
          <span className="text-white/90 font-medium">{formatTimeOrDash(giorno.entrata)}</span>
        </div>
        
        {/* Uscita */}
        <div className="text-center px-0 text-sm">
          <span className="text-white/90 font-medium">{formatTimeOrDash(giorno.uscita)}</span>
        </div>
        
        {/* Ore Lavorate */}
        <div className="text-center tabular-nums px-0 text-sm">
          <span className="text-white/90 font-medium">{formatOre(giorno.ore)}</span>
        </div>
        
        {/* Ore Extra */}
        <div className="text-right tabular-nums px-0 text-sm">
          {giorno.extra > 0 ? (
            <span className="text-yellow-400 font-bold">{formatOre(giorno.extra)}</span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
        
        {/* Modifica */}
        <div className="text-center px-0 text-sm">
          {giorno.ore > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTimbrature(giorno.giorno)}
              className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
      </div>
    );
  }

  // NUOVA: Funzione render riga sessione
  function renderRigaSessione(sessione: SessioneTimbratura, giornoParent: string, index: number) {
    return (
      <div 
        key={`${giornoParent}-${sessione.numeroSessione}-${sessione.entrata || 'no-entrata'}-${sessione.uscita || 'open'}`} 
        className="grid grid-cols-7 gap-4 p-2 border-b border-gray-600/30 text-sm bg-gray-800/20"
      >
        {/* Data - vuota */}
        <div></div>
        
        {/* Mese - indicatore sessione (solo dalla #2 in poi) */}
        <div className="text-gray-400 text-xs">
          {sessione.numeroSessione >= 2 ? `#${sessione.numeroSessione}` : ''}
        </div>
        
        {/* Entrata sessione */}
        <div className="text-center">
          <span className="text-white/70">{formatTimeOrDash(sessione.entrata)}</span>
        </div>
        
        {/* Uscita sessione */}
        <div className="text-center">
          <span className="text-white/70">
            {sessione.isAperta ? '—' : formatTimeOrDash(sessione.uscita)}
          </span>
        </div>
        
        {/* Ore sessione */}
        <div className="text-center tabular-nums">
          <span className="text-white/70">{formatOre(sessione.ore)}</span>
        </div>
        
        {/* Extra - vuoto per sessioni */}
        <div></div>
        
        {/* Modifica - vuoto per sessioni */}
        <div></div>
      </div>
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

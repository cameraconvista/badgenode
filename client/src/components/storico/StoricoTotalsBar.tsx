import { formatOre } from '@/lib/time';

interface StoricoTotalsBarProps {
  totaleMensileOre: number;
  totaleMensileExtra: number;
  giorniLavorati: number;
}

export default function StoricoTotalsBar({
  totaleMensileOre,
  totaleMensileExtra,
  giorniLavorati,
}: StoricoTotalsBarProps) {
  return (
    <div className="bg-violet-900/30 border-t-2 border-violet-400 flex-shrink-0 p-4">
      {/* Usa stesso grid della tabella per allineamento perfetto */}
      <div className="grid grid-cols-7" style={{gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr'}}>
        {/* Giorni lavorati - prime 4 colonne */}
        <div className="col-span-4 flex items-center px-4">
          <div>
            <div className="text-violet-300 font-semibold text-sm mb-1">Giorni lavorati</div>
            <div className="text-white font-bold text-base">{giorniLavorati}</div>
          </div>
        </div>

        {/* Ore totali - allineato con colonna Ore */}
        <div className="flex items-center justify-center px-4 border-l border-gray-600/30">
          <div className="text-center">
            <div className="text-violet-300 font-semibold text-sm mb-1">Ore totali</div>
            <div className="text-yellow-300 font-bold text-base tabular-nums">
              {formatOre(totaleMensileOre)}
            </div>
          </div>
        </div>

        {/* Ore totali extra - allineato con colonna Extra */}
        <div className="flex items-center justify-center px-4 border-l border-gray-600/30">
          <div className="text-center">
            <div className="text-violet-300 font-semibold text-sm mb-1">Ore totali extra</div>
            <div className="text-yellow-400 font-bold text-base tabular-nums">
              {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
            </div>
          </div>
        </div>

        {/* Spazio vuoto per colonna Modifica */}
        <div className="flex items-center justify-center px-4 border-l border-gray-600/30"></div>
      </div>
    </div>
  );
}

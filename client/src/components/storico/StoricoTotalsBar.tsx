import { formatOre } from '@/lib/time';

interface StoricoTotalsBarProps {
  totaleMensileOre: number;
  totaleMensileExtra: number;
  giorniLavorati: number;
}

export default function StoricoTotalsBar({ 
  totaleMensileOre, 
  totaleMensileExtra, 
  giorniLavorati 
}: StoricoTotalsBarProps) {
  return (
    <div className="bg-violet-900/30 border-t-2 border-violet-400 flex-shrink-0 p-4">
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-violet-300 font-semibold text-sm mb-1">Giorni lavorati</div>
          <div className="text-white font-bold text-base">{giorniLavorati}</div>
        </div>
        <div>
          <div className="text-violet-300 font-semibold text-sm mb-1">Ore totali</div>
          <div className="text-yellow-300 font-bold text-base tabular-nums">{formatOre(totaleMensileOre)}</div>
        </div>
        <div>
          <div className="text-violet-300 font-semibold text-sm mb-1">Ore totali extra</div>
          <div className="text-yellow-400 font-bold text-base tabular-nums">
            {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
}

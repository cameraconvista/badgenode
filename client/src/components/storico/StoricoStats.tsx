import { formatOre } from '@/lib/time';

interface StoricoStatsProps {
  totaleMensileOre: number;
  totaleMensileExtra: number;
  giorniLavorati: number;
}

export default function StoricoStats({ 
  totaleMensileOre, 
  totaleMensileExtra, 
  giorniLavorati 
}: StoricoStatsProps) {
  return (
    <div className="p-4 bg-gray-700/30 border-t border-gray-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Giorni lavorati</div>
          <div className="text-white font-semibold">{giorniLavorati}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Media ore/giorno</div>
          <div className="text-white font-semibold">
            {giorniLavorati > 0 
              ? formatOre(totaleMensileOre / giorniLavorati)
              : '0.00'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Ore totali</div>
          <div className="text-yellow-300 font-semibold">{formatOre(totaleMensileOre)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Ore extra</div>
          <div className="text-yellow-400 font-semibold">
            {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      {/* Usa stesso schema colonne della tabella per allineamento perfetto */}
      <table className="table-fixed w-full">
        {/* Stesso colgroup della tabella principale */}
        <colgroup>
          <col className="w-32" /> {/* Data */}
          <col className="w-24" /> {/* Mese */}
          <col className="w-20" /> {/* Entrata */}
          <col className="w-20" /> {/* Uscita */}
          <col className="w-16" /> {/* Ore */}
          <col className="w-16" /> {/* Extra */}
          <col className="w-12" /> {/* Modifica */}
        </colgroup>
        
        <tbody>
          <tr>
            {/* Prime 4 colonne - Giorni lavorati */}
            <td colSpan={4} className="px-4 text-left align-middle">
              <div>
                <div className="text-violet-300 font-semibold text-sm mb-1">Giorni lavorati</div>
                <div className="text-white font-bold text-base">{giorniLavorati}</div>
              </div>
            </td>

            {/* Colonna Ore - Totale */}
            <td className="px-4 text-center align-middle border-l border-gray-600/30">
              <div>
                <div className="text-violet-300 font-semibold text-sm mb-1">Totale</div>
                <div className="text-yellow-300 font-bold text-base tabular-nums">
                  {formatOre(totaleMensileOre)}
                </div>
              </div>
            </td>

            {/* Colonna Extra - Totale Extra */}
            <td className="px-4 text-center align-middle border-l border-gray-600/30">
              <div>
                <div className="text-violet-300 font-semibold text-sm mb-1">Totale Extra</div>
                <div className="text-yellow-400 font-bold text-base tabular-nums">
                  {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
                </div>
              </div>
            </td>

            {/* Colonna Modifica - vuota */}
            <td className="px-4 text-center align-middle border-l border-gray-600/30"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

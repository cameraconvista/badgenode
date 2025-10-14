import { formatOre } from '@/lib/time';
import ColGroupStorico from './ColGroupStorico';

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
    <div className="bn-footer bn-panel-strong w-full rounded-b-2xl">
      <div className="bn-footer-inner">
        {/* Mini tabella con stesso colgroup per allineamento perfetto */}
        <table className="bn-table__table">
        {/* Stesso colgroup della tabella principale - unica fonte di verità */}
        <ColGroupStorico />
        
        <tbody>
          <tr>
            {/* td[1] Data - Giorni lavorati */}
            <td className="bn-table__cell bn-table__cell--left bn-cell">
              <div className="text-violet-300 font-semibold text-sm mb-1">Giorni lavorati</div>
              <div className="text-white font-bold text-base">{giorniLavorati}</div>
            </td>

            {/* td[2] Mese - vuoto */}
            <td className="bn-table__cell bn-cell"></td>

            {/* td[3] Entrata - vuoto */}
            <td className="bn-table__cell bn-cell"></td>

            {/* td[4] Uscita - vuoto */}
            <td className="bn-table__cell bn-cell"></td>

            {/* td[5] Ore - Totale */}
            <td className="bn-table__cell bn-cell">
              <div className="text-violet-300 font-semibold text-sm mb-1">Totale</div>
              <div className="text-yellow-300 font-bold text-base tabular-nums">
                {formatOre(totaleMensileOre)}
              </div>
            </td>

            {/* td[6] Extra - Totale Extra */}
            <td className="bn-table__cell bn-cell">
              <div className="text-violet-300 font-semibold text-sm mb-1">Totale Extra</div>
              <div className="text-yellow-400 font-bold text-base tabular-nums">
                {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
              </div>
            </td>

            {/* td[7] Modifica - vuoto */}
            <td className="bn-table__cell bn-cell"></td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>
  );
}

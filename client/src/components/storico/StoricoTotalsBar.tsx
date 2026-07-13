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
  // Barra totali: usa le stesse larghezze di colonna della tabella (ColGroupStorico)
  // così i valori Totali cadono ESATTAMENTE sotto le colonne Ore ed Extra.
  // Testi corti (solo "Totali" + i due numeri) per non andare mai a capo.
  return (
    <div className="bn-totals-solid bn-border w-full rounded-b-2xl py-2.5">
      {/* Mobile (< sm): riga compatta flex — la tabella scrolla in orizzontale,
          quindi l'allineamento per-colonna qui sotto si romperebbe. Su telefono
          mostriamo le 3 info affiancate e centrate. */}
      <div className="flex sm:hidden items-baseline justify-around gap-1 px-3 text-white">
        <span className="inline-flex items-baseline gap-1">
          <span className="text-white/80 font-semibold text-[11px]">Giorni</span>
          <span className="font-bold text-sm tabular-nums">{giorniLavorati}</span>
        </span>
        <span className="inline-flex items-baseline gap-1">
          <span className="text-white/80 font-semibold text-[11px]">Ore</span>
          <span className="font-bold text-sm tabular-nums">{formatOre(totaleMensileOre)}</span>
        </span>
        <span className="inline-flex items-baseline gap-1">
          <span className="text-white/80 font-semibold text-[11px]">Extra</span>
          <span className="font-bold text-sm tabular-nums">
            {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
          </span>
        </span>
      </div>

      {/* Desktop (>= sm): versione a colonne allineata alla tabella. */}
      <table className="bn-table__table hidden sm:table">
        <ColGroupStorico />
        <tbody>
          <tr>
            {/* Data → Giorni lavorati */}
            <td className="bn-table__cell bn-table__cell--left">
              <span className="inline-flex items-baseline gap-2">
                <span className="text-white/80 font-semibold text-sm">Giorni lavorati</span>
                <span className="text-white font-bold text-lg tabular-nums">{giorniLavorati}</span>
              </span>
            </td>
            {/* Mese / Entrata → vuote */}
            <td className="bn-table__cell"></td>
            <td className="bn-table__cell"></td>
            {/* Uscita → etichetta "Totali" a ridosso della colonna Ore */}
            <td className="bn-table__cell text-right">
              <span className="text-white/80 font-semibold text-sm">Totali</span>
            </td>
            {/* Ore → Totale ore */}
            <td className="bn-table__cell">
              <span className="text-white font-bold text-lg tabular-nums">
                {formatOre(totaleMensileOre)}
              </span>
            </td>
            {/* Extra → Totale extra */}
            <td className="bn-table__cell">
              <span className="text-white font-bold text-lg tabular-nums">
                {totaleMensileExtra > 0 ? formatOre(totaleMensileExtra) : '0.00'}
              </span>
            </td>
            {/* Modifica → vuota */}
            <td className="bn-table__cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

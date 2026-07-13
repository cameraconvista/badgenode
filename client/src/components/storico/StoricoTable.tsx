import { AlertTriangle, Edit } from "@/lib/icons";
import { Button } from '@/components/ui/button';
import ModalKit from '@/components/ui/ModalKit';
import { formatOre, formatDataEstesa, getMeseItaliano } from '@/lib/time';
import { useState } from 'react';
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
  onEditTimbrature: (giorno_logico: string) => void;
  isLoading?: boolean;
}

function AlertMarkerIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.7c.52 0 1 .28 1.25.73l9 15.75c.25.44.25.98 0 1.42-.26.45-.73.73-1.25.73H3c-.52 0-1-.28-1.25-.73a1.43 1.43 0 0 1 0-1.42l9-15.75c.25-.45.73-.73 1.25-.73Z"
        fill="currentColor"
      />
      <rect x="10.9" y="7.1" width="2.2" height="7.9" rx="1.1" fill="#111111" />
      <circle cx="12" cy="18.05" r="1.35" fill="#111111" />
    </svg>
  );
}

export default function StoricoTable({
  timbrature: _timbrature,
  storicoDataset, // Dataset con sotto-righe
  storicoDatasetV5, // NUOVO: Dataset v5 per totali
  filters: _filters,
  oreContrattuali,
  onEditTimbrature,
  isLoading,
}: StoricoTableProps) {
  void _timbrature; void _filters;
  const [alertInfo, setAlertInfo] = useState<{
    giorno: string;
    details: string[];
  } | null>(null);
  
  // Calcola totali dal dataset v5 (fonte unica di verità) con protezione
  const list = Array.isArray(storicoDatasetV5) ? storicoDatasetV5 : [];
  const { totaleOre: totaleMensileOre, totaleExtra: totaleMensileExtra } = calcolaTotaliV5(list, oreContrattuali);
  const giorniLavorati = list.filter(d => d.ore_totali_chiuse > 0).length;

  // Evidenziazione riga: considera presenza di QUALSIASI timbratura o valori
  function hasTimbratureGiorno(g: GiornoLogicoDettagliato): boolean {
    return Boolean(
      (g.entrata && g.entrata !== '-') ||
      (g.uscita && g.uscita !== '-') ||
      (typeof g.ore === 'number' && g.ore > 0) ||
      (typeof g.extra === 'number' && g.extra > 0)
    );
  }

  function hasTimbraturaIncompleta(g: GiornoLogicoDettagliato): boolean {
    return Boolean(
      g.entrata &&
      g.entrata !== '-' &&
      (!g.uscita || g.uscita === '-')
    );
  }

  function parseMinutes(time: string | null | undefined): number | null {
    if (!time || time === '-') return null;
    const [hoursRaw, minutesRaw] = time.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  }

  function isEntrataStandard(time: string | null | undefined): boolean {
    const minutes = parseMinutes(time);
    if (minutes === null) return true;
    const firstWindow = minutes >= (16 * 60 + 45) && minutes <= (17 * 60 + 15);
    const secondWindow = minutes >= (19 * 60 + 15) && minutes <= (19 * 60 + 45);
    return firstWindow || secondWindow;
  }

  function isUscitaStandard(time: string | null | undefined): boolean {
    const minutes = parseMinutes(time);
    if (minutes === null) return true;
    const eveningWindow = minutes >= (22 * 60 + 45);
    const nightWindow = minutes <= (3 * 60 + 45);
    return eveningWindow || nightWindow;
  }

  function getOrarioAnomaloDetails(g: GiornoLogicoDettagliato): string[] {
    const details: string[] = [];
    if (g.entrata && g.entrata !== '-' && !isEntrataStandard(g.entrata)) {
      details.push(`Entrata registrata alle ${formatTimeOrDash(g.entrata)} fuori dalle fasce standard.`);
    }
    if (g.uscita && g.uscita !== '-' && !isUscitaStandard(g.uscita)) {
      details.push(`Uscita registrata alle ${formatTimeOrDash(g.uscita)} fuori dalla fascia standard.`);
    }
    return details;
  }

  function hasAnomaliaOraria(g: GiornoLogicoDettagliato): boolean {
    if (hasTimbraturaIncompleta(g)) return false;
    return getOrarioAnomaloDetails(g).length > 0;
  }

  if (isLoading) {
    return (
      <div className="bg-white/70 border border-[rgba(122,18,40,0.12)] rounded-lg p-8">
        <div className="flex items-center justify-center">
          <span className="text-[#7A5A64]">Caricamento storico...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bn-table__container">
        {/* Tabella HTML Standard */}
        <div className="bn-table__scroll-area">
          <table className="bn-table__table bn-nohover">
            {/* Definizione larghezze colonne - unica fonte di verità */}
            <ColGroupStorico />
            
            {/* Header fisso */}
            <thead className="bn-sticky-head">
              <tr>
                <th className="bn-table__header-cell bn-table__header-cell--left">Data</th>
                <th className="bn-table__header-cell">Mese</th>
                <th className="bn-table__header-cell">Entrata</th>
                <th className="bn-table__header-cell">Uscita</th>
                <th className="bn-table__header-cell tabular-nums">Ore</th>
                <th className="bn-table__header-cell tabular-nums">Extra</th>
                {/* Colonna solo-icona (matita): header senza testo per recuperare
                    spazio. Etichetta accessibile mantenuta per screen reader. */}
                <th className="bn-table__header-cell" aria-label="Modifica"></th>
              </tr>
            </thead>

            {/* Body scrollabile */}
            <tbody>
              {storicoDataset.map((row, _index) => {
                if (row.type === 'giorno') {
                  return renderRigaGiorno(row.giorno!, _index);
                } else if (row.type === 'totale') {
                  return renderRigaTotale(row, _index);
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

      <ModalKit
        open={!!alertInfo}
        onOpenChange={(open) => {
          if (!open) setAlertInfo(null);
        }}
        title="Anomalia oraria"
        description={alertInfo ? `${formatDataEstesa(alertInfo.giorno)} fuori dagli orari standard.` : undefined}
        contentClassName="max-w-[520px]"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setAlertInfo(null)}
              className="bg-[#7A1228] hover:bg-[#641021] text-white"
            >
              Ho preso visione
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-[#1C0A10]">
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="space-y-2">
              <p className="font-medium">La timbratura risulta fuori dagli orari standard previsti.</p>
              <ul className="list-disc pl-5 text-[#7A5A64]">
                {alertInfo?.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ModalKit>
    </>
  );

  // Funzione render riga giorno (convertita a HTML table)
  function renderRigaGiorno(giorno: GiornoLogicoDettagliato, _index: number) {
    void _index;
    // Determina se è weekend (sabato=6, domenica=0)
    const date = new Date(giorno.giorno);
    const weekday = date.getDay();
    const isWeekendDay = weekday === 6 || weekday === 0; // sab=6, dom=0
    
    const hasTimbri = hasTimbratureGiorno(giorno);
    const hasIncompleteTimbro = hasTimbraturaIncompleta(giorno);
    const hasOrarioAnomalo = hasAnomaliaOraria(giorno);
    return (
      <tr
        key={`giorno-${giorno.giorno}`}
        className={`
          ${isWeekendDay ? 'bn-row bn-row--weekend bn-row-dense' : 'bn-row bn-row-dense'}
          ${hasIncompleteTimbro ? 'bg-red-700 text-white [&_button]:text-white [&_span]:text-white [&_svg]:text-white' : ''}
          ${hasTimbri ? 'has-timbrature' : ''}
          ${hasTimbri && !hasIncompleteTimbro ? '' : ''}
          ${!hasTimbri ? 'opacity-60' : ''}
          text-base
        `}
      >
        {/* Data */}
        <td className="bn-table__cell bn-table__cell--left bn-cell text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatDataEstesa(giorno.giorno)}
            </span>
            {hasOrarioAnomalo ? (
              <button
                type="button"
                aria-label={`Segnala anomalia oraria del ${formatDataEstesa(giorno.giorno)}`}
                onClick={() => setAlertInfo({ giorno: giorno.giorno, details: getOrarioAnomaloDetails(giorno) })}
                className="inline-flex items-center justify-center rounded-full text-amber-500 transition-colors hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                <AlertMarkerIcon className="h-4 w-4 text-amber-400" />
              </button>
            ) : null}
          </div>
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
            <span className={hasIncompleteTimbro ? 'font-bold text-white' : 'text-amber-700 font-bold'}>
              {formatOre(giorno.extra)}
            </span>
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
            className={`h-8 w-8 p-0 ${hasIncompleteTimbro ? 'hover:bg-white/20 text-white' : 'hover:bg-white/10'}`}
          >
            <Edit
              className={`h-4 w-4 transition-colors ${hasIncompleteTimbro ? 'text-white hover:text-white' : 'text-amber-700 hover:text-amber-800'}`}
            />
          </Button>
        </td>
      </tr>
    );
  }

  // Funzione render riga sessione (convertita a HTML table)
  function renderRigaSessione(sessione: SessioneTimbratura, _giornoParent: string, _index: number) {
    void _index; void _giornoParent;
    return (
      <tr
        key={`${_giornoParent}-${sessione.numeroSessione}-${sessione.entrata || 'no-entrata'}-${sessione.uscita || 'open'}`}
        className="bn-row bn-row-dense text-base"
      >
        {/* Data - vuota (la data sta sulla riga-giorno) */}
        <td className="bn-table__cell bn-table__cell--left bn-cell"></td>

        {/* Mese → vuoto (nessuna etichetta sessione) */}
        <td className="bn-table__cell bn-cell text-sm"></td>

        {/* Entrata sessione (stesso stile della riga-giorno) */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="font-medium">{formatTimeOrDash(sessione.entrata)}</span>
        </td>

        {/* Uscita sessione */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="font-medium">
            {sessione.isAperta ? '—' : formatTimeOrDash(sessione.uscita)}
          </span>
        </td>

        {/* Ore sessione */}
        <td className="bn-table__cell bn-cell text-sm tabular-nums">
          <span className="font-medium">{formatOre(sessione.ore)}</span>
        </td>

        {/* Extra - vuoto per sessioni (è una proprietà del giorno) */}
        <td className="bn-table__cell bn-cell"></td>

        {/* Modifica - vuoto per sessioni */}
        <td className="bn-table__cell bn-cell"></td>
      </tr>
    );
  }

  // Riga riepilogo: totale ore del giorno spezzato (somma delle sessioni).
  function renderRigaTotale(
    row: { giornoParent?: string; oreTotali?: number; extraTotale?: number },
    _index: number
  ) {
    void _index;
    const ore = row.oreTotali ?? 0;
    const extra = row.extraTotale ?? 0;
    return (
      <tr
        key={`totale-${row.giornoParent}`}
        className="bn-row bn-row-dense text-sm bg-[#F1E7DD]"
      >
        {/* Data - vuota */}
        <td className="bn-table__cell bn-table__cell--left bn-cell"></td>

        {/* Etichetta totale */}
        <td className="bn-table__cell bn-cell text-sm">
          <span className="text-[#7A1228] font-semibold">Totale giorno</span>
        </td>

        {/* Entrata/Uscita - vuote */}
        <td className="bn-table__cell bn-cell"></td>
        <td className="bn-table__cell bn-cell"></td>

        {/* Ore totali giorno */}
        <td className="bn-table__cell bn-cell text-sm tabular-nums">
          <span className="text-[#7A1228] font-bold">{formatOre(ore)}</span>
        </td>

        {/* Extra giorno */}
        <td className="bn-table__cell bn-cell text-sm tabular-nums">
          {extra > 0 ? (
            <span className="text-amber-700 font-bold">{formatOre(extra)}</span>
          ) : (
            <span>—</span>
          )}
        </td>

        {/* Modifica - vuoto */}
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

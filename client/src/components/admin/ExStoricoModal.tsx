import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { aggregateTimbratureByGiornoLogico } from '@/lib/storico/aggregate';
import { formatOre } from '@/lib/time';

interface ExStoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  archiviatoIl?: string | null;
  rawRows: Array<{ tipo?: unknown; ora_locale?: unknown; giorno_logico?: unknown; data_locale?: unknown; created_at?: unknown }>;
  isLoading?: boolean;
}

export default function ExStoricoModal({ isOpen, onClose, utente, archiviatoIl, rawRows, isLoading }: ExStoricoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('a,button,input,[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { clearTimeout(t); document.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, onClose]);

  // Aggregazione giornaliera (clone assunti)
  const giornaliere = useMemo(() => {
    if (!utente) return [] as Array<{ giorno: string; mese_label: string; entrata: string | null; uscita: string | null; ore: number; extra: number }>;
    // Mappa rawRows (timbrature.service) al formato richiesto da aggregate
    const mapped = (rawRows || []).map((r) => ({
      pin: utente.pin,
      tipo: String(r.tipo) as 'entrata' | 'uscita',
      ore: String(r.ora_locale ?? ''),
      giorno_logico: String(r.giorno_logico ?? r.data_locale ?? ''),
      created_at: String(r.created_at ?? ''),
      nome: utente.nome,
      cognome: utente.cognome,
    }));
    return aggregateTimbratureByGiornoLogico(mapped, utente.pin, 8).sort((a,b) => a.giorno.localeCompare(b.giorno));
  }, [rawRows, utente]);

  const csvBlobUrl = useMemo(() => {
    if (!utente || giornaliere.length === 0) return '';
    const header = ['Nome','Cognome','PIN','Data','Entrata','Uscita','Ore','Extra'];
    const lines = [header.join(',')];
    for (const g of giornaliere) {
      const d = [
        sanitize(utente.nome),
        sanitize(utente.cognome),
        String(utente.pin),
        sanitize(g.giorno),
        sanitize(g.entrata || ''),
        sanitize(g.uscita || ''),
        String(g.ore),
        String(g.extra),
      ];
      lines.push(d.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }, [giornaliere, utente]);

  const fileName = useMemo(() => {
    const ym = (archiviatoIl || '').slice(0,7).replace('-','');
    const nm = `${(utente?.nome||'').replace(/\s+/g,'')}_${(utente?.cognome||'').replace(/\s+/g,'')}` || 'export';
    return `exdip_${nm}_${ym || 'ALL'}.csv`;
  }, [archiviatoIl, utente]);

  if (!isOpen || !utente) return null;

  return (
    <div className="bn-overlay fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-[16rem]">
      <div
        ref={modalRef}
        className="bn-admin-modal w-full max-w-3xl overflow-hidden"
        role="dialog" aria-modal="true" aria-labelledby="modal-title-storico"
      >
        <div className="bn-admin-modal__header">
          <h2 id="modal-title-storico" className="bn-admin-modal__title">
            Storico Timbrature — {utente.nome} {utente.cognome}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {archiviatoIl && (
            <p className="text-sm text-[#7A5A64]">Fino a: <span className="font-mono text-[#7A1228]">{new Date(archiviatoIl).toLocaleDateString('it-IT')}</span></p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1228]" />
            </div>
          ) : giornaliere.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#7A5A64]">Nessuna timbratura registrata</p>
            </div>
          ) : (
            <div className="bn-admin-modal__box overflow-hidden max-h-[60vh]">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[rgba(255,255,255,0.06)] h-[44px]">
                  <tr>
                    <th className="px-4 text-left text-sm font-semibold text-[#1C0A10]">Data</th>
                    <th className="px-4 text-left text-sm font-semibold text-[#1C0A10]">Mese</th>
                    <th className="px-4 text-center text-sm font-semibold text-[#1C0A10]">Entrata</th>
                    <th className="px-4 text-center text-sm font-semibold text-[#1C0A10]">Uscita</th>
                    <th className="px-4 text-center text-sm font-semibold text-[#1C0A10]">Ore</th>
                    <th className="px-4 text-center text-sm font-semibold text-[#1C0A10]">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(122,18,40,0.10)]">
                  {giornaliere.map((g) => (
                    <tr key={g.giorno} className="hover:bg-white/5">
                      <td className="px-4 py-2 text-[#1C0A10] text-sm">{formatDate(g.giorno)}</td>
                      <td className="px-4 py-2 text-left text-[#7A5A64] text-sm">{g.mese_label}</td>
                      <td className="px-4 py-2 text-center text-[#1C0A10] tabular-nums">{g.entrata || ''}</td>
                      <td className="px-4 py-2 text-center text-[#1C0A10] tabular-nums">{g.uscita || ''}</td>
                      <td className="px-4 py-2 text-center text-[#1C0A10] tabular-nums">{formatOre(g.ore)}</td>
                      <td className="px-4 py-2 text-center text-[#1C0A10] tabular-nums">{formatOre(g.extra)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bn-admin-modal__footer">
          <Button ref={closeBtnRef} type="button" onClick={onClose} className="bn-modal-btn-cancel">
            Chiudi
          </Button>
          <a
            href={csvBlobUrl || undefined}
            download={fileName}
            onClick={(e) => { if (!csvBlobUrl) e.preventDefault(); }}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${csvBlobUrl ? 'bn-modal-btn-confirm' : 'bg-[#E8DDD5] border-2 border-[#E8DDD5] text-[#7A5A64]/60 cursor-not-allowed'}`}
          >
            Esporta CSV
          </a>
        </div>
      </div>
    </div>
  );
}

function sanitize(v: string): string {
  return '"' + String(v).replace(/"/g, '""') + '"';
}

function formatDate(s: string): string {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('it-IT'); } catch { return s; }
}

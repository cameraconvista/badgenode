import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { aggregateTimbratureByGiornoLogico } from '@/lib/storico/aggregate';
import { formatOre } from '@/lib/time';

interface ExStoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  archiviatoIl?: string | null;
  rawRows: any[];
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
    const mapped = (rawRows || []).map((r: any) => ({
      pin: utente.pin,
      tipo: r.tipo as 'entrata' | 'uscita',
      ore: r.ora_locale || '',
      giorno_logico: r.giorno_logico || r.data_locale || '',
      created_at: r.created_at,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.6)',
          boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)'
        }}
        role="dialog" aria-modal="true" aria-labelledby="modal-title-storico"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 id="modal-title-storico" className="text-xl font-bold text-white">
            Storico Timbrature — {utente.nome} {utente.cognome}
          </h2>
          <Button ref={closeBtnRef} variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-white/10 text-gray-300 hover:text-white" aria-label="Chiudi modale">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {archiviatoIl && (
            <p className="text-sm text-gray-300">Fino a: <span className="font-mono text-violet-300">{new Date(archiviatoIl).toLocaleDateString('it-IT')}</span></p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400" />
            </div>
          ) : giornaliere.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300">Nessuna timbratura registrata</p>
            </div>
          ) : (
            <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800/50 max-h-[60vh]">
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
                    <th className="px-4 text-left text-sm font-semibold text-white/90">Data</th>
                    <th className="px-4 text-left text-sm font-semibold text-white/90">Mese</th>
                    <th className="px-4 text-center text-sm font-semibold text-white/90">Entrata</th>
                    <th className="px-4 text-center text-sm font-semibold text-white/90">Uscita</th>
                    <th className="px-4 text-center text-sm font-semibold text-white/90">Ore</th>
                    <th className="px-4 text-center text-sm font-semibold text-white/90">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/60">
                  {giornaliere.map((g) => (
                    <tr key={g.giorno} className="hover:bg-white/5">
                      <td className="px-4 py-2 text-white text-sm">{formatDate(g.giorno)}</td>
                      <td className="px-4 py-2 text-left text-gray-300 text-sm">{g.mese_label}</td>
                      <td className="px-4 py-2 text-center text-gray-200 tabular-nums">{g.entrata || ''}</td>
                      <td className="px-4 py-2 text-center text-gray-200 tabular-nums">{g.uscita || ''}</td>
                      <td className="px-4 py-2 text-center text-gray-200 tabular-nums">{formatOre(g.ore)}</td>
                      <td className="px-4 py-2 text-center text-gray-200 tabular-nums">{formatOre(g.extra)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-600">
          <Button type="button" onClick={onClose} className="bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all">
            Chiudi
          </Button>
          <a
            href={csvBlobUrl || undefined}
            download={fileName}
            onClick={(e) => { if (!csvBlobUrl) e.preventDefault(); }}
            className={`inline-flex items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-medium ${csvBlobUrl ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' : 'bg-gray-600 border-gray-600 text-white/60 cursor-not-allowed'}`}
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

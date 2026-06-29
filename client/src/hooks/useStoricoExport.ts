// Modulo per export storico timbrature (PDF/Excel)
// Funzioni normali (non hook) per evitare violazione Rules of Hooks
import { Utente } from '@/services/utenti.service';
import type { TurnoFull } from '@/services/storico/types';
import type { SessioneTimbratura } from '@/lib/storico/types';

export interface StoricoExportFilters {
  pin?: number;
  dal: string;
  al: string;
}

// Turno con dettaglio sessioni opzionale (per turni spezzati nell'export).
// Retrocompatibile: se `sessioni` manca, l'export si comporta come prima.
type TurnoExport = TurnoFull & { sessioni?: SessioneTimbratura[] };

interface ExportParams {
  dipendente: Utente | undefined;
  timbrature: TurnoExport[];
  filters: { pin: number; dal: string; al: string };
  toast?: (options: { title: string; description: string; variant?: 'destructive' }) => void;
}

/**
 * Tronca un orario a HH:MM (no secondi) per l'export. '—' o vuoto invariati.
 */
function hhmm(time: string | null | undefined): string {
  if (!time || time === '—') return '—';
  return time.substring(0, 5);
}

/**
 * Costruisce le righe tabella per un giorno: la riga-giorno (con totali) e,
 * se il turno è spezzato, una sotto-riga per ogni sessione dalla 2ª in poi.
 * `fmt` formatta i valori numerici (string per PDF, number per Excel).
 */
function buildRowsForGiorno(
  t: TurnoExport,
  fmt: (n: number) => string | number,
  dash: string | number
): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];
  const sessioni = t.sessioni ?? [];
  const isSpezzato = sessioni.length > 1;

  if (!isSpezzato) {
    // Giorno con turno unico: una riga con i totali del giorno (invariato).
    rows.push([
      formatDataConGiorno(t.giorno),
      formatMeseAnno(t.giorno),
      hhmm(t.entrata),
      hhmm(t.uscita),
      fmt(t.ore || 0),
      t.extra > 0 ? fmt(t.extra) : dash,
    ]);
    return rows;
  }

  // Turno spezzato: "due righe pari" — ogni sessione su una riga, poi il totale.
  // Riga-giorno = PRIMA sessione (con la data); extra solo sulla riga totale.
  const prima = sessioni[0];
  rows.push([
    formatDataConGiorno(t.giorno),
    formatMeseAnno(t.giorno),
    hhmm(prima.entrata),
    prima.isAperta ? '—' : hhmm(prima.uscita),
    fmt(prima.ore || 0),
    dash,
  ]);
  // Sessioni successive, stesso livello.
  sessioni.slice(1).forEach((s) => {
    rows.push([
      '',
      `Sessione #${s.numeroSessione}`,
      hhmm(s.entrata),
      s.isAperta ? '—' : hhmm(s.uscita),
      fmt(s.ore || 0),
      dash,
    ]);
  });
  // Riga totale del giorno: ore totali + extra calcolato sul TOTALE del giorno.
  rows.push([
    '',
    'Totale giorno',
    '',
    '',
    fmt(t.ore || 0),
    t.extra > 0 ? fmt(t.extra) : dash,
  ]);
  return rows;
}

/**
 * Formatta data con giorno della settimana (es: "01 Lunedì")
 */
function formatDataConGiorno(dataISO: string): string {
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const date = new Date(dataISO + 'T00:00:00');
  const giorno = String(date.getDate()).padStart(2, '0');
  const nomGiorno = giorni[date.getDay()];
  return `${giorno} ${nomGiorno}`;
}

/**
 * Formatta mese e anno (es: "Ottobre 2025")
 */
function formatMeseAnno(dataISO: string): string {
  const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const date = new Date(dataISO + 'T00:00:00');
  const mese = mesi[date.getMonth()];
  const anno = date.getFullYear();
  return `${mese} ${anno}`;
}

/**
 * Esporta storico timbrature in formato PDF
 */
export async function exportPDF({ dipendente, timbrature, filters, toast }: ExportParams): Promise<void> {
  try {
    // Lazy load jsPDF per ridurre bundle size
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
      
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const periodo = `${filters.dal} - ${filters.al}`;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(`Storico Timbrature — ${dipendente?.nome} ${dipendente?.cognome} (${periodo})`, 40, 40);
      
      // Ordina timbrature per data crescente (1-31)
      const timbratureOrdinate = [...timbrature].sort((a, b) => a.giorno.localeCompare(b.giorno));
      
      const rows = timbratureOrdinate.flatMap(t =>
        buildRowsForGiorno(t, (n) => n.toFixed(2), '—')
      );

      autoTable(doc, {
        startY: 64,
        head: [["Data","Mese","Entrata","Uscita","Ore","Extra"]],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [54,50,70], textColor: 255 },
        alternateRowStyles: { fillColor: [245,245,245] },
        theme: "grid"
      });
      
      const totaleOre = timbrature.reduce((sum, t) => sum + (t.ore || 0), 0);
      const totaleExtra = timbrature.reduce((sum, t) => sum + (t.extra || 0), 0);
      const giorniLavorati = timbrature.filter(t => (t.ore || 0) > 0).length;
      
      const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      doc.setFontSize(12);
      doc.text(`Giorni lavorati: ${giorniLavorati}`, 40, y);
      doc.text(`Totale: ${totaleOre.toFixed(2)}`, 240, y);
      doc.text(`Totale Extra: ${totaleExtra.toFixed(2)}`, 380, y);
      
    doc.save(`storico_${dipendente?.nome}_${periodo.replace(/\//g, '-')}.pdf`);
    
    if (toast) {
      toast({
        title: 'PDF Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    }
  } catch (error) {
    console.error('[Export PDF] Error:', error);
    if (toast) {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il PDF',
        variant: 'destructive',
      });
    }
    throw error;
  }
}

/**
 * Esporta storico timbrature in formato Excel
 */
export async function exportXLS({ dipendente, timbrature, filters, toast }: ExportParams): Promise<void> {
  try {
    // Lazy load ExcelJS per ridurre bundle size
    const { default: ExcelJS } = await import('exceljs');
      
      const periodo = `${filters.dal} - ${filters.al}`;
      const header = ["Data","Mese","Entrata","Uscita","Ore","Extra"];
      
      // Ordina timbrature per data crescente (1-31)
      const timbratureOrdinate = [...timbrature].sort((a, b) => a.giorno.localeCompare(b.giorno));
      
      const data = timbratureOrdinate.flatMap(t =>
        buildRowsForGiorno(t, (n) => n, 0)
      );
      
      const totaleOre = timbrature.reduce((sum, t) => sum + (t.ore || 0), 0);
      const totaleExtra = timbrature.reduce((sum, t) => sum + (t.extra || 0), 0);
      const giorniLavorati = timbrature.filter(t => (t.ore || 0) > 0).length;
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Storico');
      
      // Titolo
      worksheet.addRow([`Storico Timbrature — ${dipendente?.nome} ${dipendente?.cognome} (${periodo})`]);
      worksheet.addRow([]);
      
      // Header
      const headerRow = worksheet.addRow(header);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF363246' }
      };
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      // Data rows
      data.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Totali
      worksheet.addRow([]);
      worksheet.addRow(["Giorni lavorati", giorniLavorati, "", "", "Totale", totaleOre]);
      worksheet.addRow(["", "", "", "", "Totale Extra", totaleExtra]);
      
      // Auto width
      header.forEach((_, i) => {
        const maxLength = Math.max(
          header[i].length,
          ...data.map(r => String(r[i] ?? "").length)
        ) + 2;
        worksheet.getColumn(i + 1).width = maxLength;
      });
      
      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `storico_${dipendente?.nome}_${periodo.replace(/\//g, '-')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    if (toast) {
      toast({
        title: 'Excel Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    }
  } catch (error) {
    console.error('[Export Excel] Error:', error);
    if (toast) {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il file Excel',
        variant: 'destructive',
      });
    }
    throw error;
  }
}

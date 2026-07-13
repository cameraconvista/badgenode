// Export Dashboard (riepilogo dipendenti) in PDF.
// Funzioni normali (non hook) — stesso pattern di useStoricoExport.
import type { DashboardRow } from './useDashboardTotals';

export interface DashboardExportParams {
  rows: DashboardRow[];
  totali: { totaleOre: number; totaleExtra: number };
  filters: { dal: string; al: string };
  toast?: (options: { title: string; description: string; variant?: 'destructive'; duration?: number }) => void;
}

// Ri-esporta exportDashboardXLS così i dynamic import restano su un unico modulo.
export { exportDashboardXLS } from './useDashboardExport.xls';

/**
 * Esporta il riepilogo Dashboard in PDF: una riga per dipendente
 * (PIN, Nome, Cognome, Ore, Extra) + riga totali, per il periodo filtrato.
 * L'export riflette esattamente i dati a schermo (stesse righe, stesso periodo).
 */
export async function exportDashboardPDF({ rows, totali, filters, toast }: DashboardExportParams): Promise<void> {
  try {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const periodo = `${filters.dal} - ${filters.al}`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Dashboard — Riepilogo dipendenti (${periodo})`, 40, 40);

    // Ordina per PIN crescente (coerente col default della tabella).
    const ordinate = [...rows].sort((a, b) => a.pin - b.pin);
    const body = ordinate.map((r) => [
      r.pin.toString().padStart(2, '0'),
      r.nome,
      r.cognome,
      (r.totaleOre || 0).toFixed(2),
      r.totaleExtra > 0 ? r.totaleExtra.toFixed(2) : '—',
    ]);

    autoTable(doc, {
      startY: 64,
      head: [['PIN', 'Nome', 'Cognome', 'Ore', 'Extra']],
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [54, 50, 70], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
    });

    const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    doc.setFontSize(12);
    doc.text(`Dipendenti: ${rows.length}`, 40, y);
    doc.text(`Totale Ore: ${totali.totaleOre.toFixed(2)}`, 200, y);
    doc.text(`Totale Extra: ${totali.totaleExtra.toFixed(2)}`, 380, y);

    doc.save(`dashboard_${periodo.replace(/\//g, '-')}.pdf`);

    if (toast) {
      toast({ title: 'PDF Esportato', description: 'Il file è stato scaricato con successo', duration: 3000 });
    }
  } catch (error) {
    console.error('[Export Dashboard PDF] Error:', error);
    if (toast) {
      toast({ title: 'Errore Export', description: 'Impossibile generare il PDF', variant: 'destructive' });
    }
    throw error;
  }
}

// Modulo per export storico timbrature (PDF/Excel)
// Funzioni normali (non hook) per evitare violazione Rules of Hooks
import { buildRowsForGiorno, type ExportParams } from './useStoricoExport.shared';

// Ri-esporta i tipi pubblici per retrocompatibilità con i chiamanti esistenti.
export type { StoricoExportFilters, ExportParams } from './useStoricoExport.shared';
// Ri-esporta exportXLS così i dynamic import esistenti continuano a funzionare.
export { exportXLS } from './useStoricoExport.xls';

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
        duration: 3000,
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

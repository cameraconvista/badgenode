// Export storico timbrature in formato Excel (estratto da useStoricoExport.ts)
// Funzione normale (non hook) per evitare violazione Rules of Hooks
import { buildRowsForGiorno, type ExportParams } from './useStoricoExport.shared';

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
        duration: 3000,
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

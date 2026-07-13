// Export Dashboard (riepilogo dipendenti) in Excel.
// Funzione normale (non hook) — stesso pattern di useStoricoExport.xls.
import type { DashboardExportParams } from './useDashboardExport';

/**
 * Esporta il riepilogo Dashboard in Excel: una riga per dipendente
 * (PIN, Nome, Cognome, Ore, Extra) + riga totali, per il periodo filtrato.
 */
export async function exportDashboardXLS({ rows, totali, filters, toast }: DashboardExportParams): Promise<void> {
  try {
    const { default: ExcelJS } = await import('exceljs');

    const periodo = `${filters.dal} - ${filters.al}`;
    const header = ['PIN', 'Nome', 'Cognome', 'Ore', 'Extra'];

    // Ordina per PIN crescente (coerente col default della tabella).
    const ordinate = [...rows].sort((a, b) => a.pin - b.pin);
    const data = ordinate.map((r) => [
      r.pin.toString().padStart(2, '0'),
      r.nome,
      r.cognome,
      Math.round((r.totaleOre || 0) * 100) / 100,
      r.totaleExtra > 0 ? Math.round(r.totaleExtra * 100) / 100 : 0,
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dashboard');

    // Titolo
    worksheet.addRow([`Dashboard — Riepilogo dipendenti (${periodo})`]);
    worksheet.addRow([]);

    // Header
    const headerRow = worksheet.addRow(header);
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF363246' } };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Righe dati
    data.forEach((row) => worksheet.addRow(row));

    // Totali
    worksheet.addRow([]);
    worksheet.addRow(['Dipendenti', rows.length, '', 'Totale Ore', Math.round(totali.totaleOre * 100) / 100]);
    worksheet.addRow(['', '', '', 'Totale Extra', Math.round(totali.totaleExtra * 100) / 100]);

    // Larghezza automatica
    header.forEach((_, i) => {
      const maxLength =
        Math.max(header[i].length, ...data.map((r) => String(r[i] ?? '').length)) + 2;
      worksheet.getColumn(i + 1).width = maxLength;
    });

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard_${periodo.replace(/\//g, '-')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    if (toast) {
      toast({ title: 'Excel Esportato', description: 'Il file è stato scaricato con successo', duration: 3000 });
    }
  } catch (error) {
    console.error('[Export Dashboard Excel] Error:', error);
    if (toast) {
      toast({ title: 'Errore Export', description: 'Impossibile generare il file Excel', variant: 'destructive' });
    }
    throw error;
  }
}

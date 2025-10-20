// Hook per gestione export storico timbrature
// reserved: api-internal (non rimuovere senza migrazione)
// import { useState } from 'react';
// import { useToast } from '@/hooks/use-toast';
import { useToast } from './use-toast';
import { Utente } from '@/services/utenti.service';
// Lazy import per ridurre bundle size
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import type { TurnoFull } from '@/services/storico/types';
// reserved: api-internal (non rimuovere senza migrazione)
// import { TimbratureService } from '@/services/timbrature.service';
// import { downloadCSV, ExportData } from '@/lib/csv-export';

export interface StoricoExportFilters {
  pin?: number;
  dal: string;
  al: string;
}

interface UseStoricoExportProps {
  dipendente: Utente | undefined;
  timbrature: TurnoFull[];
  filters: { pin: number; dal: string; al: string };
}

export function useStoricoExport({ dipendente, timbrature, filters }: UseStoricoExportProps) {
  const { toast } = useToast();

  const handleExportPDF = async () => {
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
      
      const rows = timbrature.map(t => [
        t.giorno,
        '—', // mese placeholder
        t.entrata || '—',
        t.uscita || '—',
        t.ore?.toFixed(2) || '0.00',
        t.extra > 0 ? t.extra.toFixed(2) : '—'
      ]);
      
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
      
      toast({
        title: 'PDF Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    } catch {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportXLS = async () => {
    try {
      const periodo = `${filters.dal} - ${filters.al}`;
      const header = ["Data","Mese","Entrata","Uscita","Ore","Extra"];
      const data = timbrature.map(t => [
        t.giorno,
        '—', // mese placeholder
        t.entrata || '—',
        t.uscita || '—',
        t.ore || 0,
        t.extra || 0
      ]);
      
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
      
      toast({
        title: 'Excel Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    } catch {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il file Excel',
        variant: 'destructive',
      });
    }
  };

  return {
    handleExportPDF,
    handleExportXLS,
  };
}

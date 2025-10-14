// Hook per gestione export storico timbrature
// reserved: api-internal (non rimuovere senza migrazione)
// import { useState } from 'react';
// import { useToast } from '@/hooks/use-toast';
import { useToast } from './use-toast';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import { Utente } from '@/services/utenti.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

export function useStoricoExport({ dipendente, timbrature, filters: _filters }: UseStoricoExportProps) {
  void _filters;
  const { toast } = useToast();

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const periodo = `${_filters.dal} - ${_filters.al}`;
      
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
      
      let y = (doc as any).lastAutoTable.finalY + 24;
      doc.setFontSize(12);
      doc.text(`Giorni lavorati: ${giorniLavorati}`, 40, y);
      doc.text(`Totale: ${totaleOre.toFixed(2)}`, 240, y);
      doc.text(`Totale Extra: ${totaleExtra.toFixed(2)}`, 380, y);
      
      doc.save(`storico_${dipendente?.nome}_${periodo.replace(/\//g, '-')}.pdf`);
      
      toast({
        title: 'PDF Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    } catch (error) {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportXLS = async () => {
    try {
      const periodo = `${_filters.dal} - ${_filters.al}`;
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
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        [`Storico Timbrature — ${dipendente?.nome} ${dipendente?.cognome} (${periodo})`],
        [],
        header,
        ...data,
        [],
        ["Giorni lavorati", giorniLavorati, "", "", "Totale", totaleOre],
        ["", "", "", "", "Totale Extra", totaleExtra]
      ]);
      
      XLSX.utils.book_append_sheet(wb, ws, "Storico");
      
      // auto width
      const colW = header.map((h, i) => ({ 
        wch: Math.max(h.length, ...data.map(r => String(r[i] ?? "").length)) + 2 
      }));
      ws["!cols"] = colW;
      
      XLSX.writeFile(wb, `storico_${dipendente?.nome}_${periodo.replace(/\//g, '-')}.xlsx`);
      
      toast({
        title: 'Excel Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    } catch (error) {
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

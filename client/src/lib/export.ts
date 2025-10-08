// Utility per export PDF/Excel dello storico timbrature
import { Timbratura, formatOre, formatDataItaliana, getMeseItaliano } from './time';
import { Utente } from '@/services/utenti.service';

export interface ExportData {
  dipendente: Utente;
  timbrature: Timbratura[];
  periodo: { dal: string; al: string };
  totali: {
    oreTotali: number;
    oreExtra: number;
    giorniLavorati: number;
    mediaOreGiorno: number;
  };
}

/**
 * Genera CSV per export Excel
 */
export function generateCSV(data: ExportData): string {
  const { dipendente, timbrature, periodo, totali } = data;
  
  // Raggruppa per giorno logico
  const byDate = new Map<string, Timbratura[]>();
  for (const t of timbrature) {
    const key = t.giornologico;
    if (!byDate.has(key)) {
      byDate.set(key, []);
    }
    byDate.get(key)!.push(t);
  }

  let csv = '';
  
  // Header informazioni dipendente
  csv += 'STORICO TIMBRATURE\n';
  csv += `Dipendente,${dipendente.nome} ${dipendente.cognome}\n`;
  csv += `PIN,${dipendente.pin}\n`;
  csv += `Email,${dipendente.email || 'Non disponibile'}\n`;
  csv += `Ore Contrattuali,${formatOre(dipendente.ore_contrattuali)}\n`;
  csv += `Periodo,${periodo.dal} - ${periodo.al}\n`;
  csv += '\n';
  
  // Header tabella
  csv += 'Data,Giorno Settimana,Mese,Entrata,Uscita,Ore Lavorate,Ore Extra\n';
  
  // Dati per ogni giorno
  const sortedDates = Array.from(byDate.keys()).sort();
  for (const giorno of sortedDates) {
    const timbratureGiorno = byDate.get(giorno)!;
    const entrate = timbratureGiorno.filter(t => t.tipo === 'entrata').sort((a, b) => a.ore.localeCompare(b.ore));
    const uscite = timbratureGiorno.filter(t => t.tipo === 'uscita').sort((a, b) => b.ore.localeCompare(a.ore));
    
    const entrata = entrate.length > 0 ? entrate[0].ore.substring(0, 5) : '';
    const uscita = uscite.length > 0 ? uscite[0].ore.substring(0, 5) : '';
    
    // Calcola ore lavorate
    let oreLavorate = 0;
    if (entrate.length > 0 && uscite.length > 0) {
      const dataEntrata = new Date(`${entrate[0].data}T${entrate[0].ore}`);
      const dataUscita = new Date(`${uscite[0].data}T${uscite[0].ore}`);
      
      if (dataUscita < dataEntrata) {
        dataUscita.setDate(dataUscita.getDate() + 1);
      }
      
      const diffMs = dataUscita.getTime() - dataEntrata.getTime();
      oreLavorate = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }
    
    const oreExtra = Math.max(0, oreLavorate - dipendente.ore_contrattuali);
    
    csv += `${formatDataItaliana(giorno)},${getMeseItaliano(giorno)},${entrata},${uscita},${formatOre(oreLavorate)},${formatOre(oreExtra)}\n`;
  }
  
  // Totali
  csv += '\n';
  csv += 'TOTALI MENSILI\n';
  csv += `Ore Totali,${formatOre(totali.oreTotali)}\n`;
  csv += `Ore Extra,${formatOre(totali.oreExtra)}\n`;
  csv += `Giorni Lavorati,${totali.giorniLavorati}\n`;
  csv += `Media Ore/Giorno,${formatOre(totali.mediaOreGiorno)}\n`;
  
  return csv;
}

/**
 * Scarica file CSV
 */
export function downloadCSV(data: ExportData): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const filename = `${data.dipendente.cognome}_${data.dipendente.nome}_${data.periodo.dal.replace(/-/g, '')}_storico.csv`;
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Genera HTML per PDF (placeholder)
 */
export function generatePDFHTML(data: ExportData): string {
  // Implementazione semplificata per PDF
  // In produzione si userebbe una libreria come jsPDF o Puppeteer
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Storico Timbrature - ${data.dipendente.nome} ${data.dipendente.cognome}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totali { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Storico Timbrature</h1>
        <h2>${data.dipendente.nome} ${data.dipendente.cognome}</h2>
      </div>
      
      <div class="info">
        <p><strong>PIN:</strong> ${data.dipendente.pin}</p>
        <p><strong>Periodo:</strong> ${data.periodo.dal} - ${data.periodo.al}</p>
        <p><strong>Ore Contrattuali:</strong> ${formatOre(data.dipendente.ore_contrattuali)}/giorno</p>
      </div>
      
      <!-- Qui andrebbe la tabella completa -->
      <p><em>Funzionalità PDF in sviluppo</em></p>
      
      <div class="totali">
        <p>Ore Totali: ${formatOre(data.totali.oreTotali)}</p>
        <p>Ore Extra: ${formatOre(data.totali.oreExtra)}</p>
        <p>Giorni Lavorati: ${data.totali.giorniLavorati}</p>
      </div>
    </body>
    </html>
  `;
}

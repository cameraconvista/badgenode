// scripts/storico-logic.js

import { aggiungiOpzionePersonalizzato, aggiornaRange } from './calendar-utils.js';
import { caricaDati, pulisciCache } from './timbrature-data.js';
import { renderizzaTabella } from './timbrature-render.js';

const intestazione = document.getElementById("intestazione");
const tbody = document.getElementById("storico-body");
const selectFiltro = document.getElementById("filtro-mese");
const dataInizio = document.getElementById("data-inizio");
const dataFine = document.getElementById("data-fine");
const footerTbody = document.getElementById("totale-footer");

const urlParams = new URLSearchParams(window.location.search);
const pin = urlParams.get("pin");
if (!pin) console.warn("PIN non trovato nella URL");

let dipendente = null;
let timbrature = [];
let totaleMensile = '—';

async function aggiornaDati() {
  const { dipendente: d, timbrature: t } = await caricaDati(pin, dataInizio.value, dataFine.value);
  dipendente = d;
  timbrature = t;

  // Imposta sempre il nome del dipendente, indipendentemente dalle timbrature
  if (dipendente) {
    intestazione.textContent = `${dipendente.nome} ${dipendente.cognome}`;
  } else {
    intestazione.textContent = `PIN ${pin} - Utente non trovato`;
  }
  
  const result = renderizzaTabella(dipendente, timbrature, dataInizio.value, dataFine.value, tbody, footerTbody, pin);
  totaleMensile = result?.totaleMensile || '—';
}

selectFiltro?.addEventListener("change", () => {
  if (selectFiltro.value !== "personalizzato") {
    selectFiltro.querySelector('option[value="personalizzato"]')?.remove();
    selectFiltro.style.borderColor = '#334155';
    selectFiltro.style.color = 'white';
    aggiornaRange(selectFiltro.value, dataInizio, dataFine);
  }
  aggiornaDati();
});

dataInizio?.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato(selectFiltro);
  aggiornaDati();
});

dataFine?.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato(selectFiltro);
  aggiornaDati();
});

document.getElementById("torna-utenti")?.addEventListener("click", () => {
  window.location.href = "utenti.html";
});

document.getElementById("btn-whatsapp")?.addEventListener("click", () => {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');

  let tabellaTimbrature = '';
  document.querySelectorAll('#storico-body tr').forEach(row => {
    const celle = row.querySelectorAll('td');
    if (celle.length >= 6) {  // Verifica che ci siano almeno 6 colonne
      const data = celle[0].textContent.trim();
      const entrata = celle[2].textContent.trim();  // Colonna 2 = Entrata
      const uscita = celle[3].textContent.trim();   // Colonna 3 = Uscita
      if (entrata !== '—' || uscita !== '—') {
        tabellaTimbrature += `${data.padEnd(10)} ${entrata.padEnd(10)} ${uscita}\n`;
      }
    }
  });

  const messaggio = `CAMERA CON VISTA Bistrot\n\n*RIEPILOGO MENSILE:*\n\n👤 *${nomeCompleto}* (PIN: ${pin})\n📅 Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}\n\nOre totali: ${totaleMensile}\n\nDETTAGLIO TIMBRATURE\n\nData      Entrata    Uscita\n${tabellaTimbrature || 'Nessuna timbratura nel periodo\n'}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(messaggio)}`, '_blank');
});

// Cache per librerie
let XLSXLib = null;

document.getElementById("btn-invia")?.addEventListener("click", async () => {
  const btn = document.getElementById("btn-invia");
  if (!btn) return;
  
  const originalHTML = btn.innerHTML;
  btn.innerHTML = "Generando...";
  btn.disabled = true;
  
  try {
    console.log('📄 Inizio generazione PDF...');
    
    // Usa la libreria jsPDF già caricata nel HTML
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      throw new Error('Libreria PDF non disponibile');
    }
    
    // Usa il nome del dipendente se disponibile, altrimenti usa il nome dall'intestazione
    const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 
                        (intestazione.textContent.includes('PIN') ? intestazione.textContent.replace(/PIN \d+ - /, '') : 
                        intestazione.textContent);
    
    const doc = new jsPDF();
    
    // Header del documento - Logo aziendale
    try {
      // Carica e inserisci il logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous'; // Per evitare problemi CORS
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          try {
            // Converti immagine in base64 per jsPDF
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calcola proporzioni corrette basate sull'immagine reale
            const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
            const logoHeight = 7.5; // Altezza ridotta del 50%
            const logoWidth = logoHeight * aspectRatio; // Larghezza proporzionale
            
            // Usa dimensioni più grandi per il canvas per migliorare la qualità
            const canvasScale = 4; // Factor per alta qualità
            canvas.width = logoWidth * canvasScale;
            canvas.height = logoHeight * canvasScale;
            
            // Abilita anti-aliasing per qualità migliore
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Disegna l'immagine scalata con alta qualità mantenendo proporzioni
            ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
            const logoBase64 = canvas.toDataURL('image/png', 1.0); // Qualità massima
            
            // Centra il logo orizzontalmente nel PDF
            const xPosition = (210 - logoWidth) / 2; // 210mm è la larghezza A4
            doc.addImage(logoBase64, 'PNG', xPosition, 10, logoWidth, logoHeight);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        
        logoImg.onerror = () => reject(new Error('Immagine non trovata'));
        logoImg.src = 'assets/icons/Logo ccv black.png';
      });
      
    } catch (error) {
      console.warn('Errore caricamento logo:', error);
      // Fallback: usa solo il testo del sottotitolo senza logo
      console.log('📄 Continuo senza logo...');
    }
    
    doc.setFontSize(16);
    doc.text("RIEPILOGO MENSILE TIMBRATURE", 105, 40, { align: "center" });
    
    // Informazioni dipendente
    const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
    const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');
    
    doc.setFontSize(12);
    doc.text(`Dipendente: ${nomeCompleto} (PIN: ${pin})`, 20, 60);
    doc.text(`Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}`, 20, 70);
    doc.text(`Ore totali: ${totaleMensile}`, 20, 80);
    
    // Linea separatrice
    doc.line(20, 90, 190, 90);
    
    // Header tabella
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Data", 20, 105);
    doc.text("Entrata", 70, 105);
    doc.text("Uscita", 120, 105);
    doc.text("Ore", 160, 105);
    doc.line(20, 110, 190, 110);
    
    // Dati tabella
    doc.setFont("helvetica", "normal");
    let y = 120;
    const righe = document.querySelectorAll('#storico-body tr');
    
    righe.forEach(riga => {
      const celle = riga.querySelectorAll('td');
      if (celle.length >= 6 && y < 270) {  // Verifica che ci siano almeno 6 colonne
        const data = celle[0].textContent.trim();
        const entrata = celle[2].textContent.trim();  // Colonna 2 = Entrata
        const uscita = celle[3].textContent.trim();   // Colonna 3 = Uscita
        const ore = celle[4].textContent.trim();      // Colonna 4 = Ore
        
        // Includi tutte le righe, anche quelle senza timbrature per mostrare il periodo
        doc.text(data, 20, y);
        doc.text(entrata, 70, y);
        doc.text(uscita, 120, y);
        doc.text(ore, 160, y);
        y += 8;
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 20, 285);
    
    // Salva il PDF
    const nomeFile = `${nomeCompleto.replace(/\s+/g, '_')}_timbrature_${dataInizio.value}_${dataFine.value}.pdf`;
    doc.save(nomeFile);
    
    console.log('✅ PDF generato con successo:', nomeFile);
    
  } catch (error) {
    console.error('❌ Errore generazione PDF:', error);
    alert('Errore durante la generazione del PDF. Riprova.');
  } finally {
    // Ripristina bottone
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
});

document.getElementById("btn-esporta")?.addEventListener("click", async () => {
  // Mostra loading
  const btn = document.getElementById("btn-esporta");
  const originalText = btn.textContent;
  btn.textContent = "Generando Excel...";
  btn.disabled = true;
  
  try {
    // Lazy load con cache
    if (!XLSXLib) {
      console.log('📥 Caricamento libreria Excel...');
      XLSXLib = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
    }
    
    const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');

  const dati = [
    ['CAMERA CON VISTA Bistrot'],
    ['RIEPILOGO MENSILE TIMBRATURE'],
    [''],
    ['Dipendente:', `${nomeCompleto} (PIN: ${pin})`],
    ['Periodo:', `dal ${dataInizioFormatted} al ${dataFineFormatted}`],
    ['Ore totali:', totaleMensile],
    [''],
    ['Data', 'Entrata', 'Uscita', 'Ore Giornaliere']
  ];

  document.querySelectorAll('#storico-body tr').forEach(r => {
    const c = r.querySelectorAll('td');
    if (c.length >= 6) {  // Verifica che ci siano almeno 6 colonne
      dati.push([
        c[0].textContent.trim(),  // Data
        c[2].textContent.trim(),  // Entrata (colonna 2)
        c[3].textContent.trim(),  // Uscita (colonna 3)
        c[4].textContent.trim()   // Ore Giornaliere (colonna 4)
      ]);
    }
  });

  dati.push([''], ['TOTALE MENSILE', '', '', totaleMensile], ['Generato il:', new Date().toLocaleString('it-IT')]);
  const ws = XLSXLib.utils.aoa_to_sheet(dati);
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
  const wb = XLSXLib.utils.book_new();
  XLSXLib.utils.book_append_sheet(wb, ws, 'Timbrature');
  XLSXLib.writeFile(wb, `${nomeCompleto.replace(/\s/g, '_')}_timbrature_${dataInizio.value}_${dataFine.value}.xlsx`);
  } catch (error) {
    console.error('❌ Errore generazione Excel:', error);
    alert('Errore durante la generazione del file Excel');
  } finally {
    // Ripristina bottone
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Caricamento iniziale
if (selectFiltro && dataInizio && dataFine) {
  const valoreDefault = 'corrente';
  selectFiltro.value = valoreDefault;
  aggiornaRange(valoreDefault, dataInizio, dataFine);
  aggiornaDati();
}


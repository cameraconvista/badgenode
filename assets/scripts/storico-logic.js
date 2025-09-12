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

// Range globale con default sicuro: mese corrente
// let filtroRange = {
//   from: luxon.DateTime.now().startOf('month').toISODate(),
//   to: luxon.DateTime.now().endOf('month').toISODate()
// };

// Gestione range date e caricamento dati
let currentRange = null;

// ✅ DEFAULT ROBUSTO: primo e ultimo giorno del mese corrente
function getDefaultRange() {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = oggi.getMonth(); // 0-based

  const primoGiorno = new Date(anno, mese, 1);
  const ultimoGiorno = new Date(anno, mese + 1, 0);

  return {
    inizio: primoGiorno.toISOString().split('T')[0],
    fine: ultimoGiorno.toISOString().split('T')[0]
  };
}

// ✅ GUARDIA: Assicura sempre un range valido
function assicuraRangeValido() {
  if (!currentRange || !currentRange.inizio || !currentRange.fine) {
    currentRange = getDefaultRange();
    console.log('🔧 Range default applicato:', currentRange);
  }

  // Guardia: se from > to, correggi con swap
  if (new Date(currentRange.inizio) > new Date(currentRange.fine)) {
    const temp = currentRange.inizio;
    currentRange.inizio = currentRange.fine;
    currentRange.fine = temp;
    console.log('🔄 Range corretto (swap):', currentRange);
  }

  return currentRange;
}

function aggiornaRange() {
  const dataDa = document.getElementById('dataDa')?.value;
  const dataA = document.getElementById('dataA')?.value;

  // ✅ GUARDIA: Controlla elementi DOM presenti
  if (!document.getElementById('dataDa') || !document.getElementById('dataA')) {
    console.log('⚠️ Elementi calendario non presenti, uso default');
    currentRange = getDefaultRange();
    return;
  }

  if (dataDa && dataA) {
    currentRange = {
      inizio: dataDa,
      fine: dataA
    };

    // ✅ VALIDATION: Assicura range valido prima di procedere
    assicuraRangeValido();
    console.log('📅 Range aggiornato (corrente):', currentRange);
    caricaDatiServer();
  } else {
    // ✅ FALLBACK: Mostra messaggio se range incompleto
    const messaggioDiv = document.getElementById('messaggioRange');
    if (messaggioDiv) {
      messaggioDiv.textContent = 'Seleziona un intervallo valido';
      messaggioDiv.style.display = 'block';
    }
    console.log('⚠️ Range incompleto, fetch bloccato');
  }
}

async function caricaDatiServer() {
  // ✅ GUARDIA DOPPIA: Assicura range sempre valido
  const range = assicuraRangeValido();

  if (!range || !range.inizio || !range.fine) {
    console.log('❌ Range non valido per caricamento');
    const messaggioDiv = document.getElementById('messaggioRange');
    if (messaggioDiv) {
      messaggioDiv.textContent = 'Errore: intervallo date non valido';
      messaggioDiv.style.display = 'block';
    }
    return;
  }

  // Nascondi eventuali messaggi di errore
  const messaggioDiv = document.getElementById('messaggioRange');
  if (messaggioDiv) {
    messaggioDiv.style.display = 'none';
  }

  console.log('🔄 Caricamento dati da server...');
  // ... resto della funzione usa 'range' invece di 'currentRange'
  const { dipendente: d, timbrature: t } = await caricaDati(pin, range.inizio, range.fine);
  dipendente = d;
  timbrature = t;

  // Imposta sempre il nome del dipendente, indipendentemente dalle timbrature
  if (dipendente) {
    intestazione.textContent = `${dipendente.nome} ${dipendente.cognome}`;
  } else {
    intestazione.textContent = `PIN ${pin} - Utente non trovato`;
  }

  const result = renderizzaTabella(dipendente, timbrature, range.inizio, range.fine, tbody, footerTbody, pin);
  totaleMensile = result?.totaleMensile || '—';
}


// Funzione di utilità per la validazione del range
function validaRange(range) {
  if (!range || !range.from || !range.to) {
    return null; // Range non valido
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(range.from) || !dateRegex.test(range.to)) {
    return null; // Formato data non valido
  }

  const dataInizioObj = new Date(range.from);
  const dataFineObj = new Date(range.to);

  if (isNaN(dataInizioObj.getTime()) || isNaN(dataFineObj.getTime())) {
    return null; // Date non valide
  }

  if (dataInizioObj > dataFineObj) {
    return null; // La data di inizio non può essere successiva alla data di fine
  }

  return range; // Range valido
}


async function aggiornaDati() {
  // Valida il range prima di usarlo
  filtroRange = validaRange(filtroRange);

  if (!filtroRange) {
    mostraMessaggio('Errore nella selezione del periodo', 'error');
    return;
  }

  // Aggiorna gli input HTML con il range corrente valido
  if (dataInizio && dataFine) {
    dataInizio.value = filtroRange.from;
    dataFine.value = filtroRange.to;
  }

  const { dipendente: d, timbrature: t } = await caricaDati(pin, filtroRange.from, filtroRange.to);
  dipendente = d;
  timbrature = t;

  // Imposta sempre il nome del dipendente, indipendentemente dalle timbrature
  if (dipendente) {
    intestazione.textContent = `${dipendente.nome} ${dipendente.cognome}`;
  } else {
    intestazione.textContent = `PIN ${pin} - Utente non trovato`;
  }

  const result = renderizzaTabella(dipendente, timbrature, filtroRange.from, filtroRange.to, tbody, footerTbody, pin);
  totaleMensile = result?.totaleMensile || '—';
}

selectFiltro?.addEventListener("change", () => {
  if (selectFiltro.value !== "personalizzato") {
    selectFiltro.querySelector('option[value="personalizzato"]')?.remove();
    selectFiltro.style.borderColor = '#334155';
    selectFiltro.style.color = 'white';
    aggiornaRange(selectFiltro.value, dataInizio, dataFine);
    // Aggiorna filtroRange con i nuovi valori dopo aggiornaRange
    filtroRange = {
      from: dataInizio.value,
      to: dataFine.value
    };
  }
  aggiornaDati();
});

dataInizio?.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato(selectFiltro);
  // Aggiorna filtroRange quando cambiano le date input
  filtroRange = {
    from: dataInizio.value,
    to: dataFine.value
  };
  aggiornaDati();
});

dataFine?.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato(selectFiltro);
  // Aggiorna filtroRange quando cambiano le date input
  filtroRange = {
    from: dataInizio.value,
    to: dataFine.value
  };
  aggiornaDati();
});

document.getElementById("torna-utenti")?.addEventListener("click", () => {
  window.location.href = "utenti.html";
});

// Funzioni per esportazione PDF ed Excel
async function exportaPDF() {
  filtroRange = validaRange(filtroRange);

  if (!filtroRange) {
    mostraMessaggio('Seleziona un intervallo valido per esportare', 'error');
    return;
  }

  const btn = document.getElementById("btn-invia");
  if (!btn) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = "Generando...";
  btn.disabled = true;

  try {
    console.log('📄 Inizio generazione PDF...');

    const jsPDFModule = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const { jsPDF } = jsPDFModule.default || window.jspdf || {};
    if (!jsPDF) {
      throw new Error('Libreria PDF non disponibile');
    }

    const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 
                        (intestazione.textContent.includes('PIN') ? intestazione.textContent.replace(/PIN \d+ - /, '') : 
                        intestazione.textContent);

    const doc = new jsPDF();

    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous'; 

      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
            const logoHeight = 7.5; 
            const logoWidth = logoHeight * aspectRatio; 
            const canvasScale = 4; 
            canvas.width = logoWidth * canvasScale;
            canvas.height = logoHeight * canvasScale;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
            const logoBase64 = canvas.toDataURL('image/png', 1.0); 
            const xPosition = (210 - logoWidth) / 2; 
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
      console.log('📄 Continuo senza logo...');
    }

    doc.setFontSize(16);
    doc.text("RIEPILOGO MENSILE TIMBRATURE", 105, 40, { align: "center" });

    const dataInizioFormatted = new Date(filtroRange.from).toLocaleDateString('it-IT');
    const dataFineFormatted = new Date(filtroRange.to).toLocaleDateString('it-IT');

    doc.setFontSize(12);
    doc.text(`Dipendente: ${nomeCompleto} (PIN: ${pin})`, 20, 60);
    doc.text(`Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}`, 20, 70);
    doc.text(`Ore totali: ${totaleMensile}`, 20, 80);

    doc.line(20, 90, 190, 90);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Data", 20, 105);
    doc.text("Entrata", 70, 105);
    doc.text("Uscita", 120, 105);
    doc.text("Ore", 160, 105);
    doc.line(20, 110, 190, 110);

    doc.setFont("helvetica", "normal");
    let y = 120;
    const righe = document.querySelectorAll('#storico-body tr');

    righe.forEach(riga => {
      const celle = riga.querySelectorAll('td');
      if (celle.length >= 6 && y < 270) {
        const data = celle[0].textContent.trim();
        const entrata = celle[2].textContent.trim();
        const uscita = celle[3].textContent.trim();
        const ore = celle[4].textContent.trim();

        doc.text(data, 20, y);
        doc.text(entrata, 70, y);
        doc.text(uscita, 120, y);
        doc.text(ore, 160, y);
        y += 8;
      }
    });

    doc.setFontSize(8);
    doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 20, 285);

    const nomeFile = `${nomeCompleto.replace(/\s+/g, '_')}_timbrature_${filtroRange.from}_${filtroRange.to}.pdf`;
    doc.save(nomeFile);

    console.log('✅ PDF generato con successo:', nomeFile);

  } catch (error) {
    console.error('❌ Errore generazione PDF:', error);
    alert('Errore durante la generazione del PDF. Riprova.');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

document.getElementById("btn-invia")?.addEventListener("click", exportaPDF);


async function exportaExcel() {
  filtroRange = validaRange(filtroRange);

  if (!filtroRange) {
    mostraMessaggio('Seleziona un intervallo valido per esportare', 'error');
    return;
  }

  const btn = document.getElementById("btn-excel");
  if (!btn) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = "Generando...";
  btn.disabled = true;

  try {
    console.log('📊 Inizio generazione Excel...');

    const XLSXModule = await import('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const XLSX = XLSXModule.default || window.XLSX;
    if (!XLSX) {
      throw new Error('Libreria Excel non disponibile');
    }
    const { utils, writeFile } = XLSX;

    const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 
                        (intestazione.textContent.includes('PIN') ? intestazione.textContent.replace(/PIN \d+ - /, '') : 
                        intestazione.textContent);

    const dataInizioFormatted = new Date(filtroRange.from).toLocaleDateString('it-IT');
    const dataFineFormatted = new Date(filtroRange.to).toLocaleDateString('it-IT');

    const worksheetData = [];

    worksheetData.push(['RIEPILOGO MENSILE TIMBRATURE'], [''], 
                      [`Dipendente: ${nomeCompleto} (PIN: ${pin})`],
                      [`Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}`],
                      [`Ore totali: ${totaleMensile}`],
                      [''], 
                      ['Data', 'Entrata', 'Uscita', 'Ore']);

    const righe = document.querySelectorAll('#storico-body tr');

    righe.forEach(riga => {
      const celle = riga.querySelectorAll('td');
      if (celle.length >= 6) {
        const data = celle[0].textContent.trim();
        const entrata = celle[2].textContent.trim();
        const uscita = celle[3].textContent.trim();
        const ore = celle[4].textContent.trim();

        worksheetData.push([data, entrata, uscita, ore]);
      }
    });

    worksheetData.push([''], [`Generato il: ${new Date().toLocaleString('it-IT')}`]);

    const workbook = utils.book_new();
    const worksheet = utils.aoa_to_sheet(worksheetData);

    const columnWidths = [
      { wch: 12 }, 
      { wch: 10 }, 
      { wch: 10 }, 
      { wch: 8 }   
    ];
    worksheet['!cols'] = columnWidths;

    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' }
      };
    }

    ['A7', 'B7', 'C7', 'D7'].forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E6E6E6' } }
        };
      }
    });

    utils.book_append_sheet(workbook, worksheet, 'Timbrature');

    const nomeFile = `${nomeCompleto.replace(/\s+/g, '_')}_timbrature_${filtroRange.from}_${filtroRange.to}.xlsx`;
    writeFile(workbook, nomeFile);

    console.log('✅ Excel generato con successo:', nomeFile);

  } catch (error) {
    console.error('❌ Errore generazione Excel:', error);
    alert('Errore durante la generazione del file Excel. Riprova.');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

document.getElementById("btn-excel")?.addEventListener("click", exportaExcel);


// Funzione di utilità per messaggi
function mostraMessaggio(messaggio, tipo = 'info') {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = messaggio;
    statusElement.className = `status-message ${tipo} visible`;
    setTimeout(() => {
      statusElement.className = 'status-message';
    }, 3000);
  } else {
    console.log(`${tipo.toUpperCase()}: ${messaggio}`);
  }
}


// Funzione di inizializzazione per la pagina storico
export function initStorico() {
  // Verifica che gli elementi necessari esistano
  const dataDa = document.getElementById('data-inizio'); // Corretto ID elemento
  const dataA = document.getElementById('data-fine'); // Corretto ID elemento
  const filtroMese = document.getElementById('filtro-mese'); // Corretto ID elemento

  if (!dataDa || !dataA) {
    console.error('Elementi calendario non trovati in questa pagina');
    return;
  }

  // Assicura che il range sia sempre inizializzato con valori validi
  if (!filtroRange || !filtroRange.from || !filtroRange.to) {
    filtroRange = {
      from: luxon.DateTime.now().startOf('month').toISODate(),
      to: luxon.DateTime.now().endOf('month').toISODate()
    };
  } else {
    // Se filtroRange esiste ma le date sono invalide, usa i default
    filtroRange = validaRange(filtroRange) || {
      from: luxon.DateTime.now().startOf('month').toISODate(),
      to: luxon.DateTime.now().endOf('month').toISODate()
    };
  }

  // Imposta i valori degli input date in base al filtroRange corrente
  if (dataInizio) dataInizio.value = filtroRange.from;
  if (dataFine) dataFine.value = filtroRange.to;
  if (selectFiltro) selectFiltro.value = 'personalizzato'; // Assumiamo che le date impostate siano personalizzate

  // Carica i dati iniziali
  aggiornaDati();
}


// ✅ INIZIALIZZAZIONE SICURA E ORDINATA
document.addEventListener('DOMContentLoaded', function() {
  console.log('📊 STORICO: Inizializzazione...');

  // 1. Set range default PRIMA di tutto
  currentRange = getDefaultRange();
  console.log('🔧 Range default impostato:', currentRange);

  // 2. Aggiorna input date con valori default
  const dataInizioEl = document.getElementById('data-inizio');
  const dataFineEl = document.getElementById('data-fine');
  
  if (dataInizioEl && dataFineEl) {
    dataInizioEl.value = currentRange.inizio;
    dataFineEl.value = currentRange.fine;
    console.log('📅 Input date inizializzati con range default');
  }

  // 3. Primo caricamento IMMEDIATO con range default
  caricaDatiServer();

  // 4. Bind eventi DOPO primo caricamento
  dataInizioEl?.addEventListener('change', aggiornaRange);
  dataFineEl?.addEventListener('change', aggiornaRange);
  
  console.log('✅ Storico inizializzato e caricamento avviato');
});

// Assicurati che luxon sia disponibile globalmente o importalo se necessario
// Se luxon non è globalmente disponibile, dovresti aggiungere:
// import * as luxon from 'luxon';
// altrimenti, assicurati che sia caricato tramite un tag <script> in HTML
// Esempio: <script src="https://cdnjs.cloudflare.com/ajax/libs/luxon/3.4.4/luxon.min.js"></script>
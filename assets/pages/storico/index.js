// storico/index.js - Logica completa consolidata

// Import dei moduli necessari
import { aggiungiOpzionePersonalizzato, aggiornaRange } from '../../scripts/calendar-utils.js';
import { caricaDati, pulisciCache } from '../../scripts/timbrature-data.js';
import { renderizzaTabella } from '../../scripts/timbrature-render.js';

// === GESTIONE DOM CON GUARDIE ===

function getElementSafely(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Elemento ${id} non trovato nel DOM`);
  }
  return element;
}

// Elementi DOM con gestione sicura
const intestazione = getElementSafely("intestazione");
const tbody = getElementSafely("storico-body");
const selectFiltro = getElementSafely("filtro-mese");
const dataInizio = getElementSafely("data-inizio");
const dataFine = getElementSafely("data-fine");
const footerTbody = getElementSafely("totale-footer");
const totaleOreEl = getElementSafely("totale-ore");
const totaleExtraEl = getElementSafely("totale-extra");

// Verifica che il tbody esista, altrimenti mostra messaggio
function ensureTbodyExists() {
  const tbody = document.getElementById("storico-body");
  if (!tbody) {
    // Cerca una tabella esistente e aggiungi tbody
    const table = document.querySelector("table");
    if (table) {
      const newTbody = document.createElement("tbody");
      newTbody.id = "storico-body";
      newTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Nessun record disponibile</td></tr>';
      table.appendChild(newTbody);
      return newTbody;
    }
  }
  return tbody;
}

// === GESTIONE PIN E DATI ===

const urlParams = new URLSearchParams(window.location.search);
const pin = urlParams.get("pin");
if (!pin) console.warn("PIN non trovato nella URL");

let dipendente = null;
let timbrature = [];
let totaleMensile = '—';

// Cache per librerie esterne
let XLSXLib = null;

// === FUNZIONI PRINCIPALI ===

async function aggiornaDati() {
  console.log('📅 Range aggiornato (corrente):', {
    inizio: dataInizio?.value,
    fine: dataFine?.value
  });

  if (!pin) {
    console.warn('❌ PIN mancante, impossibile caricare i dati');
    return;
  }

  try {
    console.log('🔄 Caricamento dati da server...');
    const { dipendente: d, timbrature: t } = await caricaDati(pin, dataInizio?.value, dataFine?.value);
    dipendente = d;
    timbrature = t;
    console.log(`✅ Caricati ${t.length} record dal server`);

    if (dipendente && intestazione) {
      intestazione.textContent = `${dipendente.nome} ${dipendente.cognome}`;
    }

    const currentTbody = ensureTbodyExists();
    if (currentTbody) {
      const result = renderizzaTabella(dipendente, timbrature, dataInizio?.value, dataFine?.value, currentTbody, footerTbody, pin);
      totaleMensile = result?.totaleMensile || '—';
      
      // Aggiorna i nuovi elementi del footer
      if (totaleOreEl) totaleOreEl.textContent = Number(result?.totaleOre ?? 0).toFixed(2);
      if (totaleExtraEl) totaleExtraEl.textContent = Number(result?.totaleExtra ?? 0).toFixed(2);
      
      // Se non ci sono dati, mostra messaggio
      if (!timbrature || timbrature.length === 0) {
        currentTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Nessun record trovato per il periodo selezionato</td></tr>';
      }
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento dati:', error);
  }
}

// === GESTIONE EVENTI ===

// Filtro mese
if (selectFiltro) {
  selectFiltro.addEventListener("change", () => {
    if (selectFiltro.value !== "personalizzato") {
      selectFiltro.querySelector('option[value="personalizzato"]')?.remove();
      selectFiltro.style.borderColor = '#334155';
      selectFiltro.style.color = 'white';
      if (dataInizio && dataFine) {
        aggiornaRange(selectFiltro.value, dataInizio, dataFine);
      }
    }
    aggiornaDati();
  });
}

// Date
if (dataInizio) {
  dataInizio.addEventListener("change", () => {
    aggiungiOpzionePersonalizzato(selectFiltro);
    aggiornaDati();
  });
}

if (dataFine) {
  dataFine.addEventListener("change", () => {
    aggiungiOpzionePersonalizzato(selectFiltro);
    aggiornaDati();
  });
}

// === GESTIONE BOTTONI ===

// Bottone WhatsApp (se presente)
const btnWhatsapp = document.getElementById("btn-whatsapp");
if (btnWhatsapp) {
  btnWhatsapp.addEventListener("click", () => {
    const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
    const dataInizioFormatted = new Date(dataInizio?.value).toLocaleDateString('it-IT');
    const dataFineFormatted = new Date(dataFine?.value).toLocaleDateString('it-IT');

    let tabellaTimbrature = '';
    const righe = document.querySelectorAll('#storico-body tr');
    righe.forEach(row => {
      const celle = row.querySelectorAll('td');
      if (celle.length >= 3) {
        const data = celle[0].textContent.trim();
        const entrata = celle[1].textContent.trim();
        const uscita = celle[2].textContent.trim();
        if (entrata !== '—' || uscita !== '—') {
          tabellaTimbrature += `${data.padEnd(10)} ${entrata.padEnd(10)} ${uscita}\n`;
        }
      }
    });

    const messaggio = `CAMERA CON VISTA Bistrot\n\n*RIEPILOGO MENSILE:*\n\n👤 *${nomeCompleto}* (PIN: ${pin})\n📅 Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}\n\nOre totali: ${totaleMensile}\n\nDETTAGLIO TIMBRATURE\n\nData      Entrata    Uscita\n${tabellaTimbrature || 'Nessuna timbratura nel periodo\n'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(messaggio)}`, '_blank');
  });
}

// PDF Export
const btnInvia = document.getElementById("btn-invia");
if (btnInvia) {
  btnInvia.addEventListener("click", async () => {
    const originalHTML = btnInvia.innerHTML;
    btnInvia.innerHTML = "Generando...";
    btnInvia.disabled = true;
    
    try {
      console.log('📄 Inizio generazione PDF...');
      
      // Carica dinamicamente la libreria jsPDF
      if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        throw new Error('Libreria PDF non disponibile');
      }
      
      const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
      const doc = new jsPDF();
      
      // Header del documento
      doc.setFontSize(20);
      doc.text("CAMERA CON VISTA Bistrot", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("RIEPILOGO MENSILE TIMBRATURE", 105, 35, { align: "center" });
      
      // Informazioni dipendente
      const dataInizioFormatted = new Date(dataInizio?.value).toLocaleDateString('it-IT');
      const dataFineFormatted = new Date(dataFine?.value).toLocaleDateString('it-IT');
      
      doc.setFontSize(12);
      doc.text(`Dipendente: ${nomeCompleto} (PIN: ${pin})`, 20, 55);
      doc.text(`Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}`, 20, 65);
      doc.text(`Ore totali: ${totaleMensile}`, 20, 75);
      
      // Linea separatrice
      doc.line(20, 85, 190, 85);
      
      // Header tabella
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Data", 20, 100);
      doc.text("Entrata", 70, 100);
      doc.text("Uscita", 120, 100);
      doc.text("Ore", 160, 100);
      doc.line(20, 105, 190, 105);
      
      // Dati tabella
      doc.setFont("helvetica", "normal");
      let y = 115;
      const righe = document.querySelectorAll('#storico-body tr');
      
      righe.forEach(riga => {
        const celle = riga.querySelectorAll('td');
        if (celle.length >= 4 && y < 270) {
          const data = celle[0].textContent.trim();
          const entrata = celle[1].textContent.trim();
          const uscita = celle[2].textContent.trim();
          const ore = celle[3].textContent.trim();
          
          // Solo righe con dati significativi
          if (entrata !== '—' || uscita !== '—' || ore !== '0.00') {
            doc.text(data, 20, y);
            doc.text(entrata, 70, y);
            doc.text(uscita, 120, y);
            doc.text(ore, 160, y);
            y += 8;
          }
        }
      });
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 20, 285);
      
      // Salva il PDF
      const nomeFile = `${nomeCompleto.replace(/\s+/g, '_')}_timbrature_${dataInizio?.value}_${dataFine?.value}.pdf`;
      doc.save(nomeFile);
      
      console.log('✅ PDF generato con successo:', nomeFile);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      alert('Errore durante la generazione del PDF. Riprova.');
    } finally {
      btnInvia.innerHTML = originalHTML;
      btnInvia.disabled = false;
    }
  });
}

// Excel Export
const btnEsporta = document.getElementById("btn-esporta");
if (btnEsporta) {
  btnEsporta.addEventListener("click", async () => {
    const originalText = btnEsporta.textContent;
    btnEsporta.textContent = "Generando Excel...";
    btnEsporta.disabled = true;
    
    try {
      // Lazy load con cache
      if (!XLSXLib) {
        console.log('📥 Caricamento libreria Excel...');
        XLSXLib = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
      }
      
      const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
      const dataInizioFormatted = new Date(dataInizio?.value).toLocaleDateString('it-IT');
      const dataFineFormatted = new Date(dataFine?.value).toLocaleDateString('it-IT');

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

      const righe = document.querySelectorAll('#storico-body tr');
      righe.forEach(r => {
        const c = r.querySelectorAll('td');
        if (c.length >= 4) {
          dati.push([
            c[0].textContent.trim(),
            c[1].textContent.trim(),
            c[2].textContent.trim(),
            c[3].textContent.trim()
          ]);
        }
      });

      dati.push([''], ['TOTALE MENSILE', '', '', totaleMensile], ['Generato il:', new Date().toLocaleString('it-IT')]);
      const ws = XLSXLib.utils.aoa_to_sheet(dati);
      ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
      const wb = XLSXLib.utils.book_new();
      XLSXLib.utils.book_append_sheet(wb, ws, 'Timbrature');
      XLSXLib.writeFile(wb, `${nomeCompleto.replace(/\s/g, '_')}_timbrature_${dataInizio?.value}_${dataFine?.value}.xlsx`);
      
    } catch (error) {
      console.error('❌ Errore generazione Excel:', error);
      alert('Errore durante la generazione del file Excel');
    } finally {
      btnEsporta.textContent = originalText;
      btnEsporta.disabled = false;
    }
  });
}

// === GESTIONE ICONE CALENDARIO ===
// Sposta qui la logica che era inline nell'HTML
function setupCalendarIcons() {
  document.querySelectorAll('.icona-calendario-campo').forEach(icon => {
    icon.addEventListener('click', function (e) {
      e.preventDefault();
      const campoId = this.getAttribute('data-campo');
      const campo = document.getElementById(campoId);
      if (campo) {
        try {
          campo.focus();
          if (campo.showPicker && typeof campo.showPicker === 'function') {
            campo.showPicker();
          }
        } catch (err) {
          campo.focus();
        }
      }
    });
  });
}

// === GESTIONE BOTTONE INDIETRO MIGLIORATA ===
function setupBackButton() {
  // Gestione con delegazione per tutti i possibili selettori
  document.addEventListener('click', (ev) => {
    const selectors = [
      '[data-action="back"]',
      '#torna-utenti',
      '.btn-torna-utenti',
      '.back', '.btn-back', '.torna', '.indietro',
      '[aria-label*="indietro"]', '[title*="indietro"]',
      '[aria-label*="torna"]', '[title*="torna"]'
    ].join(',');
    
    const el = ev.target.closest(selectors);
    if (!el) return;
    
    ev.preventDefault();
    
    try {
      // Prova a mantenere il PIN se presente
      const urlParams = new URLSearchParams(window.location.search);
      const pin = urlParams.get('pin');
      
      if (pin) {
        window.location.href = `utenti.html?pin=${encodeURIComponent(pin)}`;
      } else {
        // Fallback: torna indietro o vai a utenti.html
        if (history.length > 1) {
          history.back();
        } else {
          window.location.href = 'utenti.html';
        }
      }
    } catch (error) {
      console.error('Errore nel ritorno:', error);
      window.location.href = 'utenti.html';
    }
  });
}

// === INIZIALIZZAZIONE ===
function initStorico() {
  console.log('🚀 Inizializzazione pagina storico...');
  
  // Setup eventi
  setupCalendarIcons();
  setupBackButton();
  
  // Caricamento iniziale con range di default
  if (selectFiltro && dataInizio && dataFine) {
    const valoreDefault = 'corrente';
    selectFiltro.value = valoreDefault;
    aggiornaRange(valoreDefault, dataInizio, dataFine);
    aggiornaDati();
  } else {
    console.warn('❌ Alcuni elementi di controllo non trovati, caricamento parziale');
  }
}

// === BOOTSTRAP ===
function bootstrap() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStorico, { once: true });
  } else {
    initStorico();
  }
}

// Avvio automatico
bootstrap();

// Espone funzioni globalmente per compatibilità
window.initStorico = initStorico;
window.aggiornaDati = aggiornaDati;

// Diagnostica per debug
window.__storicoDiag = () => ({
  pin: pin,
  elementi: {
    intestazione: !!intestazione,
    tbody: !!tbody,
    selectFiltro: !!selectFiltro,
    dataInizio: !!dataInizio,
    dataFine: !!dataFine
  },
  dipendente: dipendente,
  timbrature: timbrature?.length || 0
});
/* --- guardia robusta per il renderer della pagina storico --- */
(function(){
  function __ensureStoricoTbody(){
    var id = "storico-body"; // verrà rimpiazzato dal build qui sotto
    var tb = document.getElementById(id);
    if (!tb) {
      // trova la tabella con intestazioni tipiche e crea il tbody mancante
      var tables = Array.from(document.querySelectorAll("table"));
      for (var t of tables){
        var heads = Array.from(t.querySelectorAll("thead th")).map(x=>x.textContent.trim().toLowerCase());
        if (heads.length && heads.join("|").includes("data") && heads.join("|").includes("modifica")){
          tb = t.tBodies[0] || t.appendChild(document.createElement("tbody"));
          tb.id = id;
          break;
        }
      }
      if (!tb){
        // estremo fallback: crea una tabella minima in fondo al main
        var container = document.querySelector("main") || document.body;
        var nt = document.createElement("table");
        var th = document.createElement("thead");
        th.innerHTML = "<tr><th>Data</th><th>Entrata</th><th>Uscita</th><th>Ore</th><th>EXTRA</th><th>Modifica</th></tr>";
        tb = document.createElement("tbody"); tb.id = id;
        nt.appendChild(th); nt.appendChild(tb);
        container.appendChild(nt);
      }
    }
    return tb;
  }

  // patch soft: se qualcuno prova a scrivere nel tbody, prima lo garantiamo
  window.__ensureStoricoTbody = __ensureStoricoTbody;

  // Inizializzazione DOM ready: garantisci che il tbody esista
  (document.readyState === "loading"
   ? document.addEventListener("DOMContentLoaded", __ensureStoricoTbody, {once:true})
   : __ensureStoricoTbody());

  // Back robusto (gestisce varianti di selettori/icone)
  function __storicoBack(){
    try {
      var url = new URL(window.location.href);
      var pin = url.searchParams.get("pin") || "";
      if (pin) window.location.href = "utenti.html?pin=" + encodeURIComponent(pin);
      else window.history.back();
    } catch(e){ window.history.back(); }
  }
  document.addEventListener("click", function(ev){
    var el = ev.target.closest('[data-action="back"], .btn-back, .back, [aria-label="Torna a Utenti"], .fa-arrow-left, .bi-arrow-left, button[title="Indietro"]');
    if (el) { ev.preventDefault(); __storicoBack(); }
  }, {passive:false});
})();


// assets/pages/index/index.js
'use strict';

// === Codice migrato dall'inline (copiato così com'è) ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://txmjqrnitfsiytbytxlc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
);

let currentUser = null;

// Funzione per aggiornare data e ora
function aggiornaDataOra() {
  try {
    const now = new Date();
    
    // Aggiorna elementi se esistenti
    const dataElement = document.getElementById('dataGiorno');
    const oraElement = document.getElementById('ora');
    
    if (dataElement) {
      dataElement.textContent = now.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (oraElement) {
      oraElement.textContent = now.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  } catch (error) {
    // Gestione sicura degli errori senza spam in console
    console.debug('[aggiornaDataOra] Elementi DOM non disponibili, skip aggiornamento');
  }
}

// Funzione per gestire click sui numeri del keypad
async function clickNumero(numero) {
  const display = document.getElementById('pinInput');
  if (display && display.value.length < 2) {
    display.value += numero;
    
    if (display.value.length === 2) {
      await verificaPin(display.value);
    }
  }
}

// Funzione per cancellare l'ultimo numero
function cancellaUltimo() {
  const display = document.getElementById('pinInput');
  if (display) {
    display.value = display.value.slice(0, -1);
  }
}

// Funzione per verificare il PIN
async function verificaPin(pin) {
  try {
    const { data: utente, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (utente) {
      currentUser = utente;
      await registraTimbratura(utente);
    } else {
      mostraErrore("PIN non riconosciuto");
    }
  } catch (error) {
    console.error('Errore durante la verifica del PIN:', error);
    mostraErrore("Errore durante la verifica del PIN");
  }
  
  // Reset del display
  const display = document.getElementById('pinInput');
  if (display) display.value = '';
}

// Funzione per registrare la timbratura
async function registraTimbratura(utente) {
  try {
    const oggi = new Date().toISOString().split('T')[0];
    const oraAttuale = new Date().toTimeString().slice(0, 8);

    // Verifica se esiste già una timbratura oggi
    const { data: timbratureOggi, error: errorVerifica } = await supabase
      .from('timbrature')
      .select('*')
      .eq('pin', utente.pin)
      .eq('data', oggi)
      .order('ore', { ascending: false });

    if (errorVerifica) {
      throw errorVerifica;
    }

    let tipoTimbratura = 'entrata';
    let messaggio = `${utente.nome} ${utente.cognome}`;

    if (timbratureOggi && timbratureOggi.length > 0) {
      const ultimaTimbratura = timbratureOggi[0];
      tipoTimbratura = ultimaTimbratura.tipo === 'entrata' ? 'uscita' : 'entrata';
    }

    // Inserisci la nuova timbratura
    const { error: errorInserimento } = await supabase
      .from('timbrature')
      .insert([{
        pin: utente.pin,
        data: oggi,
        ore: oraAttuale,
        tipo: tipoTimbratura
      }]);

    if (errorInserimento) {
      throw errorInserimento;
    }

    messaggio += tipoTimbratura === 'entrata' 
      ? `\n🟢 ENTRATA registrata alle ${oraAttuale}`
      : `\n🔴 USCITA registrata alle ${oraAttuale}`;

    mostraSuccesso(messaggio);
    
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    mostraErrore(`Errore durante la registrazione: ${error.message}`);
  }
}

// Funzione per mostrare messaggi di successo
function mostraSuccesso(messaggio) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.innerHTML = messaggio;
    statusDiv.className = 'status-message visible success';
    
    setTimeout(() => {
      statusDiv.className = 'status-message';
      statusDiv.innerHTML = '';
    }, 3000);
  }
}

// Funzione per mostrare messaggi di errore
function mostraErrore(messaggio) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = messaggio;
    statusDiv.className = 'status-message visible error';
    
    setTimeout(() => {
      statusDiv.className = 'status-message';
      statusDiv.textContent = '';
    }, 3000);
  }
}

// Funzione per aprire il modal admin
function apriModalAdmin() {
  const modalHTML = `
    <div id="adminModal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    ">
      <div style="
        background: linear-gradient(135deg, #1a365d, #2d3748);
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <h3 style="margin-top: 0; color: white; font-size: 24px;">Accesso Admin</h3>
        <p style="color: #a0aec0; margin-bottom: 20px;">Inserisci il PIN amministratore</p>
        <input type="password" id="adminPinInput" placeholder="PIN Admin" style="
          padding: 15px;
          font-size: 18px;
          border: 2px solid #4a5568;
          border-radius: 8px;
          background: #2d3748;
          color: white;
          text-align: center;
          width: 200px;
          margin-bottom: 20px;
        " maxlength="4">
        <div>
          <button onclick="verificaPinAdmin()" style="
            background: #15803d; 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            margin: 0 10px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
          ">Conferma</button>
          <button onclick="chiudiModalAdmin()" style="
            background: #dc2626; 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            margin: 0 10px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
          ">Annulla</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('adminPinInput').focus();
  
  // Gestisce Enter
  document.getElementById('adminPinInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') verificaPinAdmin();
  });
}

function verificaPinAdmin() {
  const pinAdmin = document.getElementById('adminPinInput').value;
  if (pinAdmin === "1909") {
    window.location.href = "utenti.html";
  } else {
    alert("PIN non valido. Accesso negato.");
    chiudiModalAdmin();
  }
}

function chiudiModalAdmin() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.remove();
}

//__moved__: setInterval(aggiornaDataOra, 1000);

// Inizializza la data/ora al caricamento
//__moved__: aggiornaDataOra();

// --- SAFE WRAPPER: evita che errori blocchino il modulo ---
function __safeAggiornaDataOra(){
  try { if (typeof aggiornaDataOra === "function") aggiornaDataOra(); }
  catch(e){ console.warn("[index] aggiornaDataOra: elemento mancante, skip", e && e.message ? e.message : e); }
}

// === Esposizione globale delle funzioni chiamate da attributi HTML ===
// Esposizione per attributi onclick
try { if (typeof window.clickNumero !== 'function' && typeof clickNumero === 'function') { window.clickNumero = clickNumero; } } catch (e) {}
try { if (typeof window.cancellaUltimo !== 'function' && typeof cancellaUltimo === 'function') { window.cancellaUltimo = cancellaUltimo; } } catch (e) {}
try { if (typeof window.apriModalAdmin !== 'function' && typeof apriModalAdmin === 'function') { window.apriModalAdmin = apriModalAdmin; } } catch (e) {}
try { if (typeof window.verificaPinAdmin !== 'function' && typeof verificaPinAdmin === 'function') { window.verificaPinAdmin = verificaPinAdmin; } } catch (e) {}
try { if (typeof window.chiudiModalAdmin !== 'function' && typeof chiudiModalAdmin === 'function') { window.chiudiModalAdmin = chiudiModalAdmin; } } catch (e) {}

// --- Bootstrap sicuro su DOM pronto ---
(function __indexSafeInit__(){
  // garantisce esecuzione dopo parsing completo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      __safeAggiornaDataOra();
      try {
        const __safeTick = () => { try { if (typeof aggiornaDataOra==='function') aggiornaDataOra(); } catch(_){} };
        setInterval(__safeTick, 1000);
      } catch(_){}
    }, { once: true });
  } else {
    __safeAggiornaDataOra();
    try {
      const __safeTick = () => { try { if (typeof aggiornaDataOra==='function') aggiornaDataOra(); } catch(_){} };
      setInterval(__safeTick, 1000);
    } catch(_){}
  }
})();

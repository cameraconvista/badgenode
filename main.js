// 🚀 BADGEBOX - Entry Point Unico Applicativo
// Architettura: ES Modules + API globali controllate

import { initializeSupabaseClient } from './assets/scripts/supabase-client.js';

// 🔧 Inizializzazione asincrona con validazione
(async function initializeApp() {
  try {
    // 1. Inizializza client Supabase con test connessione
    const supabaseClient = await initializeSupabaseClient();

    // 2. Rendi disponibile globalmente (necessario per HTML inline)
    window.supabase = supabaseClient;
    console.log('✅ Supabase connesso e disponibile');

    // 3. Inizializza interfaccia utente
    initializeInterface();

  } catch (error) {
    console.error('❌ Errore critico inizializzazione:', error);
    mostraStatus('Errore connessione database - contattare amministratore', 'error', 10000);
  }
})();

function initializeInterface() {
  const giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  const pinInput = document.getElementById("pinInput");
  const status = document.getElementById("status");

  // Verifica campo PIN
  if (!pinInput) {
    console.error("❌ Campo PIN non trovato!");
    return;
  }

  // Sistema status unificato
  window.mostraStatus = function(messaggio, tipo = "info", durata = 3000) {
    status.textContent = messaggio;
    if (tipo === "success" && (messaggio.includes("ENTRATA") || messaggio.includes("USCITA"))) {
      status.className = `status-message ${tipo} visible timbratura-flash`;
      setTimeout(() => status.className = "status-message", 7000);
    } else {
      status.className = `status-message ${tipo} visible`;
      setTimeout(() => status.className = "status-message", durata);
    }
  };

  // Aggiornamento data/ora usando Date nativo
  window.aggiornaDataOra = function() {
    const ora = new Date();
    const oraItalia = new Date(ora.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
    
    const giorno = giorni[oraItalia.getDay()];
    const numeroGiorno = oraItalia.getDate();
    const mese = mesi[oraItalia.getMonth()];
    
    const ore = oraItalia.getHours().toString().padStart(2, '0');
    const minuti = oraItalia.getMinutes().toString().padStart(2, '0');
    const secondi = oraItalia.getSeconds().toString().padStart(2, '0');
    
    document.getElementById("dataGiorno").textContent = `${giorno} ${numeroGiorno} ${mese}`;
    document.getElementById("ora").textContent = `${ore}:${minuti}:${secondi}`;
  };

  // 🔧 API GLOBALE: Gestione ingranaggio (richiesta da HTML)
  window.apriImpostazioni = function() {
    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: #1e293b; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.5); min-width: 300px;">
          <h3 style="color: white; margin-bottom: 20px;">Accesso Amministratore</h3>
          <input type="password" id="adminPinInput" placeholder="PIN admin" style="width: 100%; padding: 12px; font-size: 18px; text-align: center; border: none; border-radius: 8px; margin-bottom: 20px;" maxlength="4" />
          <div>
            <button id="confirmBtn" style="background: #15803d; color: white; border: none; padding: 12px 20px; margin: 10px; border-radius: 8px; cursor: pointer;">Conferma</button>
            <button id="cancelBtn" style="background: #dc2626; color: white; border: none; padding: 12px 20px; margin: 10px; border-radius: 8px; cursor: pointer;">Annulla</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      const adminInput = document.getElementById('adminPinInput');
      const confirmBtn = document.getElementById('confirmBtn');
      const cancelBtn = document.getElementById('cancelBtn');

      if (adminInput) adminInput.focus();

      confirmBtn.onclick = function() {
        const pin = document.getElementById('adminPinInput').value;
        if (pin === "1909") {
          document.getElementById('adminModal').remove();
          window.location.href = "utenti.html";
        } else {
          alert("PIN non valido!");
          adminInput.value = '';
          adminInput.focus();
        }
      };

      cancelBtn.onclick = function() {
        document.getElementById('adminModal').remove();
      };

      adminInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') confirmBtn.click();
      });
    }, 100);
  };

  // Event listeners keypad unificati
  document.querySelectorAll(".keypad-button").forEach((key) => {
    key.addEventListener("click", (event) => {
      const text = key.textContent.trim();

      if (key.id === 'settings-btn') {
        apriImpostazioni();
        return;
      }

      if (text === 'C') {
        pinInput.value = '';
        return;
      }

      if (/^[0-9]$/.test(text) && pinInput.value.length < 4) {
        pinInput.value += text;
      }
    }, { passive: true });
  });

  // Avvio timer
  aggiornaDataOra();
  setInterval(aggiornaDataOra, 1000);
  pinInput.focus();
}

// Kill-switch per Service Worker (query ?no-sw=1)
const urlParams = new URLSearchParams(window.location.search);
const forceUnregisterSW = urlParams.get('no-sw') === '1';

if (forceUnregisterSW && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('[SW] Force unregistered:', registration.scope);
    });
  });

  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('[SW] Force cache deleted:', name);
      });
    });
  }
  console.log('🔧 Kill-switch attivato: SW rimosso. Ricarica senza ?no-sw=1');
}

// Registra il Service Worker solo in produzione
else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[SW] Registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Auto-cleanup in development: unregister tutti i SW esistenti
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('[SW] Auto-unregistered in DEV:', registration.scope);
    });
  });

  // Pulisce Cache Storage
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('[SW] Auto-cache deleted:', name);
      });
    });
  }
}
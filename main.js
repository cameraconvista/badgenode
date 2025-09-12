// Inizializzazione asincrona con validazione
(async function initializeApp() {
  try {
    const { supabaseClient } = await import('./assets/scripts/supabase-client.js');
    
    // Validazione connessione prima di renderla globale
    const { data, error } = await supabaseClient.from('utenti').select('count').limit(1);
    if (error) {
      console.error('❌ Test connessione Supabase fallito:', error);
      throw error;
    }
    
    window.supabase = supabaseClient;
    console.log('✅ Supabase pronto e connesso');
    
    // Inizializza interfaccia solo dopo conferma connessione
    initializeInterface();
    
  } catch (error) {
    console.error('❌ Errore critico inizializzazione:', error);
    mostraStatus('Errore connessione database - contattare amministratore', 'error', 10000);
  }
})();

function initializeInterface() {

const { DateTime } = luxon;
const giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const pinInput = document.getElementById("pinInput");
const status = document.getElementById("status");

// Aggiornamento data/ora
function aggiornaDataOra() {
  const ora = DateTime.now().setZone("Europe/Rome");
  document.getElementById("dataGiorno").textContent = `${giorni[ora.weekday % 7]} ${ora.day} ${mesi[ora.month - 1]}`;
  document.getElementById("ora").textContent = ora.toFormat("HH:mm:ss");
}

// Sistema status
function mostraStatus(messaggio, tipo = "info", durata = 3000) {
  status.textContent = messaggio;
  if (tipo === "success" && (messaggio.includes("ENTRATA") || messaggio.includes("USCITA"))) {
    status.className = `status-message ${tipo} visible timbratura-flash`;
    setTimeout(() => status.className = "status-message", 7000);
  } else {
    status.className = `status-message ${tipo} visible`;
    setTimeout(() => status.className = "status-message", durata);
  }
}

// 🔧 GESTIONE INGRANAGGIO - FUNZIONE GLOBALE UNICA
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

// Verifica esistenza campo PIN
  if (!pinInput) {
    console.error("❌ Campo PIN non trovato!");
    return;
  }
  
  // UNICO set di listener per keypad
  document.querySelectorAll(".keypad-button").forEach((key) => {
    key.addEventListener("click", (event) => {
      const text = key.textContent.trim();
      
      // Gestione pulsante settings
      if (key.id === 'settings-btn') {
        apriImpostazioni();
        return;
      }
      
      // Gestione clear
      if (text === 'C') {
        pinInput.value = '';
        return;
      }
      
      // Gestioni numeri (0-9)
      if (/^[0-9]$/.test(text) && pinInput.value.length < 4) {
        pinInput.value += text;
      }
    }, { passive: true });
  });
  
  // Avvia timer data/ora
  aggiornaDataOra();
  setInterval(aggiornaDataOra, 1000);
}

// Avvia inizializzazione al caricamento DOM
document.addEventListener('DOMContentLoaded', function() {
  // Interfaccia inizializzata solo dopo init Supabase asincrono
});
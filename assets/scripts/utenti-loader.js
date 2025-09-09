
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.info('[UTENTI] init DOMContentLoaded');
  console.time('[UTENTI] load');
  
  try {
    const { data, error, status } = await supabase
      .from('utenti')
      .select('*')
      .order('cognome', { ascending: true });

    if (error) {
      console.error('[UTENTI] supabase error', { status, error });
      document.getElementById('lista-dipendenti').innerHTML = `
        <tr><td colspan="5" style="color: red; text-align: center; padding: 20px;">
          Errore caricamento utenti: ${error.message}
        </td></tr>
      `;
      return;
    }
    
    console.debug('[UTENTI] rows', data?.length ?? 0);
    renderUtenti(data || []);
  } catch (e) {
    console.error('[UTENTI] exception', e);
    document.getElementById('lista-dipendenti').innerHTML = `
      <tr><td colspan="5" style="color: red; text-align: center; padding: 20px;">
        Errore di connessione: ${e.message}
      </td></tr>
    `;
  } finally {
    console.timeEnd('[UTENTI] load');
  }
});

function renderUtenti(utenti) {
  const tbody = document.getElementById('lista-dipendenti');
  
  if (!tbody) {
    console.error('[UTENTI] Elemento lista-dipendenti non trovato');
    return;
  }

  if (utenti.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">
        Nessun utente trovato
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = utenti.map(utente => `
    <tr>
      <td>
        <a href="storico.html?pin=${utente.pin}" style="color: #60a5fa; text-decoration: none;">
          📊
        </a>
      </td>
      <td>${utente.pin}</td>
      <td>${utente.nome}</td>
      <td>${utente.cognome}</td>
      <td>
        <button onclick="modificaUtente('${utente.pin}')" title="Modifica">✏️</button>
        <button onclick="eliminaUtente('${utente.pin}', '${utente.nome}', '${utente.cognome}')" 
                title="Elimina" style="color: #ef4444;">❌</button>
      </td>
    </tr>
  `).join('');

  console.info('[UTENTI] render complete', utenti.length, 'users');
}

// Funzioni globali per i pulsanti
window.modificaUtente = function(pin) {
  console.log('Modifica utente PIN:', pin);
  // TODO: implementare modale modifica
  alert('Funzione modifica in sviluppo');
};

window.eliminaUtente = function(pin, nome, cognome) {
  if (confirm(`Eliminare ${nome} ${cognome} (PIN: ${pin})?`)) {
    console.log('Elimina utente PIN:', pin);
    // TODO: implementare eliminazione
    alert('Funzione elimina in sviluppo');
  }
};

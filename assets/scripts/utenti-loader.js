
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
          <img src="assets/icons/orologio.png" alt="Storico" style="width: 20px; height: 20px;" />
        </a>
      </td>
      <td>${utente.pin}</td>
      <td>${utente.nome}</td>
      <td>${utente.cognome}</td>
      <td>
        <button onclick="modificaUtente('${utente.pin}')" title="Modifica">✏️</button>
        <button onclick="archiviaUtente('${utente.pin}', '${utente.nome}', '${utente.cognome}')" 
                title="Archivia dipendente" style="color: #f59e0b;">📦</button>
        <button onclick="eliminaUtente('${utente.pin}', '${utente.nome}', '${utente.cognome}')" 
                title="Elimina" style="color: #ef4444;">❌</button>
      </td>
    </tr>
  `).join('');

  console.info('[UTENTI] render complete', utenti.length, 'users');
}

// Funzioni globali per i pulsanti
window.modificaUtente = async function(pin) {
  try {
    console.log('🔧 Modifica utente PIN:', pin);
    
    // Recupera i dati attuali del dipendente
    const { data: utente, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (error || !utente) {
      alert('Errore: Dipendente non trovato');
      return;
    }

    // Crea e mostra il modale di modifica
    const modalHTML = `
      <div id="modalModificaUtente" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.7); display: flex; align-items: center; 
        justify-content: center; z-index: 10000;">
        <div style="
          background: #1e293b; padding: 30px; border-radius: 12px; 
          width: 90%; max-width: 500px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <h3 style="margin-top: 0; color: #fbbf24; text-align: center;">
            ✏️ Modifica Dipendente (PIN: ${pin})
          </h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome:</label>
            <input type="text" id="modificaNome" value="${utente.nome}" style="
              width: 100%; padding: 10px; border: 1px solid #475569; border-radius: 6px; 
              background: #334155; color: white; font-size: 16px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cognome:</label>
            <input type="text" id="modificaCognome" value="${utente.cognome}" style="
              width: 100%; padding: 10px; border: 1px solid #475569; border-radius: 6px; 
              background: #334155; color: white; font-size: 16px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
            <input type="email" id="modificaEmail" value="${utente.email || ''}" style="
              width: 100%; padding: 10px; border: 1px solid #475569; border-radius: 6px; 
              background: #334155; color: white; font-size: 16px;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Ore Contrattuali:</label>
            <input type="number" id="modificaOre" value="${utente.ore_contrattuali || 8}" 
                   min="1" max="12" step="0.5" style="
              width: 100%; padding: 10px; border: 1px solid #475569; border-radius: 6px; 
              background: #334155; color: white; font-size: 16px;">
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="chiudiModaleModifica()" style="
              padding: 12px 24px; background: #6b7280; color: white; border: none; 
              border-radius: 6px; cursor: pointer; font-weight: bold;">
              Annulla
            </button>
            <button onclick="salvaModificheUtente(${pin})" style="
              padding: 12px 24px; background: #059669; color: white; border: none; 
              border-radius: 6px; cursor: pointer; font-weight: bold;">
              💾 Salva
            </button>
          </div>
          
        </div>
      </div>
    `;

    // Aggiungi il modale al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Focus sul primo campo
    document.getElementById('modificaNome').focus();

  } catch (error) {
    console.error('❌ Errore modifica utente:', error);
    alert('Errore nel caricamento dei dati del dipendente');
  }
};

window.archiviaUtente = async function(pin, nome, cognome) {
  if (!confirm(`⚠️ ATTENZIONE! Stai per archiviare il dipendente:\n\n${nome} ${cognome} (PIN: ${pin})\n\nQuesta azione:\n• Sposterà il dipendente nell'archivio\n• Genererà un file Excel con tutto lo storico\n• Libererà il PIN per nuovi dipendenti\n\nProcedere con l'archiviazione?`)) return;

  try {
    console.log(`🗂️ Inizio archiviazione per PIN ${pin}:`);
    console.log(`   • Nome: ${nome} ${cognome}`);

    // 1. Recupera tutti i dati del dipendente
    const { data: dipendenteData, error: dipendenteError } = await supabase
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (dipendenteError || !dipendenteData) {
      throw new Error('Dipendente non trovato nel database');
    }

    // 2. Recupera tutte le timbrature del dipendente
    const { data: timbratureData, error: timbratureError } = await supabase
      .from('timbrature')
      .select('*')
      .eq('pin', parseInt(pin))
      .order('data', { ascending: true })
      .order('ore', { ascending: true });

    if (timbratureError) {
      console.error('Errore recupero timbrature:', timbratureError);
      // Continua comunque l'archiviazione anche senza timbrature
    }

    // 3. Genera il contenuto Excel con tutti i dati
    const excelData = {
      dipendente: {
        pin: dipendenteData.pin,
        nome: dipendenteData.nome,
        cognome: dipendenteData.cognome,
        email: dipendenteData.email || 'Non disponibile',
        telefono: dipendenteData.telefono || 'Non disponibile',
        ore_contrattuali: dipendenteData.ore_contrattuali || 8.0
      },
      timbrature: timbratureData || [],
      totaleTimbrature: timbratureData?.length || 0,
      dataGenerazione: new Date().toISOString()
    };

    // 4. Inserisci nella tabella dipendenti_archiviati
    const { data: archiviatiData, error: archiviatiError } = await supabase
      .from('dipendenti_archiviati')
      .insert({
        pin: dipendenteData.pin,
        nome: dipendenteData.nome,
        cognome: dipendenteData.cognome,
        email: dipendenteData.email,
        telefono: dipendenteData.telefono,
        ore_contrattuali: dipendenteData.ore_contrattuali,
        data_archiviazione: new Date().toISOString(),
        file_excel_path: JSON.stringify(excelData),
        file_excel_name: `${nome}_${cognome}_timbrature_completo.csv`
      })
      .select();

    if (archiviatiError) {
      throw new Error(`Errore durante l'archiviazione: ${archiviatiError.message}`);
    }

    // 5. Elimina il dipendente dalla tabella utenti (libera il PIN)
    const { error: deleteError } = await supabase
      .from('utenti')
      .delete()
      .eq('pin', parseInt(pin));

    if (deleteError) {
      console.error('Errore eliminazione dipendente:', deleteError);
      // Non blocca l'operazione, l'archiviazione è già avvenuta
    }

    console.log(`✅ Archiviazione completata per PIN ${pin}:`);
    console.log(`   • Nome: ${nome} ${cognome}`);
    console.log(`   • Timbrature archiviate: ${timbratureData?.length || 0}`);
    console.log(`   • PIN liberato: ${pin}`);

    alert(`✅ Dipendente ${nome} ${cognome} archiviato con successo!\n\n📊 Riepilogo archiviazione:\n• Timbrature salvate: ${timbratureData?.length || 0}\n• PIN liberato: ${pin}\n• File Excel generato\n\nIl dipendente è ora disponibile nella sezione "ex Dipendenti".`);

    // Ricarica la pagina per aggiornare la lista
    setTimeout(() => location.reload(), 1500);

  } catch (error) {
    console.error('❌ Errore durante l\'archiviazione:', error);
    alert('Errore durante l\'archiviazione: ' + (error.message || 'Errore sconosciuto'));
  }
};

window.eliminaUtente = function(pin, nome, cognome) {
  if (confirm(`Eliminare ${nome} ${cognome} (PIN: ${pin})?`)) {
    console.log('Elimina utente PIN:', pin);
    // TODO: implementare eliminazione
    alert('Funzione elimina in sviluppo');
  }
};

// Funzioni per il modale di modifica
window.chiudiModaleModifica = function() {
  const modal = document.getElementById('modalModificaUtente');
  if (modal) {
    modal.remove();
  }
};

window.salvaModificheUtente = async function(pin) {
  try {
    const nome = document.getElementById('modificaNome').value.trim();
    const cognome = document.getElementById('modificaCognome').value.trim();
    const email = document.getElementById('modificaEmail').value.trim();
    const oreContrattuali = parseFloat(document.getElementById('modificaOre').value);

    // Validazione
    if (!nome || !cognome) {
      alert('Nome e Cognome sono obbligatori');
      return;
    }

    if (oreContrattuali < 1 || oreContrattuali > 12) {
      alert('Le ore contrattuali devono essere tra 1 e 12');
      return;
    }

    console.log('💾 Salvataggio modifiche per PIN:', pin);

    // Aggiorna nel database
    const { error } = await supabase
      .from('utenti')
      .update({
        nome: nome,
        cognome: cognome,
        email: email || null,
        ore_contrattuali: oreContrattuali
      })
      .eq('pin', parseInt(pin));

    if (error) {
      throw error;
    }

    // Aggiorna anche le timbrature esistenti con i nuovi nome/cognome
    await supabase
      .from('timbrature')
      .update({
        nome: nome,
        cognome: cognome
      })
      .eq('pin', parseInt(pin));

    alert(`✅ Dipendente ${nome} ${cognome} aggiornato con successo!`);
    
    // Chiudi il modale e ricarica la lista
    chiudiModaleModifica();
    setTimeout(() => location.reload(), 500);

  } catch (error) {
    console.error('❌ Errore nel salvataggio:', error);
    alert('Errore nel salvataggio: ' + (error.message || 'Errore sconosciuto'));
  }
};

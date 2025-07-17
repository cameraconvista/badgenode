
// modale-modifica.js

import { supabaseClient } from './supabase-client.js';

export function apriModaleModifica(data, timbratureEntrata, timbratureUscita, pin, timbraturaId) {
  console.log('🔧 Apertura modale modifica per data:', data);
  
  const modal = document.getElementById('modalOverlay');
  const modaleDataEntrata = document.getElementById('modale-data-entrata');
  const modaleDataUscita = document.getElementById('modale-data-uscita');
  const modaleEntrata = document.getElementById('modale-entrata');
  const modaleUscita = document.getElementById('modale-uscita');
  
  if (!modal || !modaleDataEntrata || !modaleDataUscita || !modaleEntrata || !modaleUscita) {
    console.error('❌ Elementi modale non trovati');
    return;
  }

  // Imposta le date e orari esistenti
  if (timbratureEntrata && timbratureEntrata.length > 0) {
    modaleDataEntrata.value = timbratureEntrata[0].giornologico || timbratureEntrata[0].data || data;
    modaleEntrata.value = timbratureEntrata[0].ore.slice(0, 5);
  } else {
    modaleDataEntrata.value = data;
    modaleEntrata.value = '';
  }
  
  if (timbratureUscita && timbratureUscita.length > 0) {
    modaleDataUscita.value = timbratureUscita[timbratureUscita.length - 1].giornologico || timbratureUscita[timbratureUscita.length - 1].data || data;
    modaleUscita.value = timbratureUscita[timbratureUscita.length - 1].ore.slice(0, 5);
  } else {
    modaleDataUscita.value = data;
    modaleUscita.value = '';
  }

  // Mostra il modale
  modal.style.display = 'flex';
  
  // Gestori eventi
  const btnSalva = document.getElementById('btnSalva');
  const btnElimina = document.getElementById('btnElimina');
  const btnChiudi = document.getElementById('btnChiudi');
  
  // Rimuovi eventi precedenti
  btnSalva.onclick = null;
  btnElimina.onclick = null;
  btnChiudi.onclick = null;
  
  // Salva modifiche
  btnSalva.onclick = async () => {
    await salvaModifiche(
      modaleDataEntrata.value, 
      modaleEntrata.value, 
      modaleDataUscita.value, 
      modaleUscita.value, 
      pin, 
      timbraturaId,
      data // data originale per eventuali cancellazioni
    );
    chiudiModale();
  };
  
  // Elimina timbrature
  btnElimina.onclick = async () => {
    if (confirm('Sei sicuro di voler eliminare le timbrature di questo giorno?')) {
      await eliminaTimbrature(data, pin);
      chiudiModale();
    }
  };
  
  // Chiudi modale
  btnChiudi.onclick = chiudiModale;
  
  // Chiudi cliccando fuori
  modal.onclick = (e) => {
    if (e.target === modal) {
      chiudiModale();
    }
  };
}

function chiudiModale() {
  const modal = document.getElementById('modalOverlay');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function salvaModifiche(dataEntrata, oraEntrata, dataUscita, oraUscita, pin, timbraturaId, dataOriginale) {
  try {
    console.log('💾 Salvataggio modifiche per:', { dataEntrata, oraEntrata, dataUscita, oraUscita, pin });
    
    // Prima recupera i dati dell'utente per nome e cognome
    const { data: userData, error: userError } = await supabaseClient
      .from('utenti')
      .select('nome, cognome')
      .eq('pin', parseInt(pin))
      .single();
    
    if (userError || !userData) {
      throw new Error('Impossibile recuperare i dati dell\'utente');
    }
    
    // CANCELLAZIONE SICURA - elimina le timbrature esistenti per la data originale
    if (dataOriginale) {
      console.log('🗑️ Eliminazione timbrature per data originale:', dataOriginale);
      
      // Cancellazione con doppio controllo: sia per 'giornologico' che per 'data'
      const { error: deleteError1 } = await supabaseClient
        .from('timbrature')
        .delete()
        .eq('pin', parseInt(pin))
        .eq('giornologico', dataOriginale);
      
      const { error: deleteError2 } = await supabaseClient
        .from('timbrature')
        .delete()
        .eq('pin', parseInt(pin))
        .eq('data', dataOriginale)
        .is('giornologico', null);
      
      if (deleteError1) {
        console.warn('⚠️ Errore cancellazione (giornologico):', deleteError1);
      }
      if (deleteError2) {
        console.warn('⚠️ Errore cancellazione (data):', deleteError2);
      }
      
      console.log('✅ Pulizia timbrature completata per data:', dataOriginale);
    }
    
    // Salva le nuove timbrature se presenti
    const timbratureDaInserire = [];
    
    // GESTIONE CORRETTA DEL GIORNO LOGICO (come nel sistema principale)
    if (oraEntrata && dataEntrata) {
      const [oreEntrata, minutiEntrata] = oraEntrata.split(':').map(Number);
      let giornoLogicoEntrata = dataEntrata;
      
      // Se entrata è tra 00:00 e 04:59, appartiene al giorno lavorativo precedente
      if (oreEntrata >= 0 && oreEntrata < 5) {
        const dataEntrataObj = new Date(dataEntrata + 'T00:00:00');
        dataEntrataObj.setDate(dataEntrataObj.getDate() - 1);
        giornoLogicoEntrata = dataEntrataObj.toISOString().split('T')[0];
      }
      
      timbratureDaInserire.push({
        pin: parseInt(pin),
        nome: userData.nome,
        cognome: userData.cognome,
        tipo: 'entrata',
        data: dataEntrata,
        ore: oraEntrata + ':00',
        giornologico: giornoLogicoEntrata
      });
    }
    
    if (oraUscita && dataUscita) {
      const [oreUscita, minutiUscita] = oraUscita.split(':').map(Number);
      let giornoLogicoUscita = dataUscita;
      
      // Se uscita è tra 00:00 e 04:59, appartiene al giorno lavorativo precedente
      if (oreUscita >= 0 && oreUscita < 5) {
        const dataUscitaObj = new Date(dataUscita + 'T00:00:00');
        dataUscitaObj.setDate(dataUscitaObj.getDate() - 1);
        giornoLogicoUscita = dataUscitaObj.toISOString().split('T')[0];
      }
      
      timbratureDaInserire.push({
        pin: parseInt(pin),
        nome: userData.nome,
        cognome: userData.cognome,
        tipo: 'uscita',
        data: dataUscita,
        ore: oraUscita + ':00',
        giornologico: giornoLogicoUscita
      });
    }
    
    // VALIDAZIONE PRIMA DELL'INSERIMENTO
    if (!oraEntrata && !oraUscita) {
      throw new Error('Inserisci almeno un orario (entrata o uscita)');
    }
    
    if (timbratureDaInserire.length > 0) {
      console.log('📝 Inserimento nuove timbrature:', timbratureDaInserire);
      
      // Inserimento con validazione
      const { data: insertedData, error: insertError } = await supabaseClient
        .from('timbrature')
        .insert(timbratureDaInserire)
        .select();
      
      if (insertError) {
        throw new Error(`Errore inserimento: ${insertError.message} (Code: ${insertError.code})`);
      }
      
      if (!insertedData || insertedData.length === 0) {
        throw new Error('Nessuna timbratura inserita - verifica i permessi');
      }
      
      console.log('✅ Nuove timbrature inserite con successo:', insertedData);
    }
    
    console.log('✅ Modifiche salvate con successo');
    alert('Modifiche salvate correttamente!');
    
    // PREVENZIONE LOOP: ricarica solo dopo aver chiuso il modale
    chiudiModale();
    
    // Ricarica i dati con delay maggiore
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Errore nel salvataggio:', error);
    
    // GESTIONE ERRORI SPECIFICA PER PREVENIRE LOOP
    let errorMessage = 'Errore nel salvataggio delle modifiche: ';
    if (error.message?.includes('utente')) {
      errorMessage += 'Utente non trovato nel sistema.';
    } else if (error.message?.includes('permission') || error.message?.includes('RLS')) {
      errorMessage += 'Permessi insufficienti per modificare le timbrature.';
    } else if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      errorMessage += 'Timbratura già esistente per questo orario.';
    } else if (error.message?.includes('almeno un orario')) {
      errorMessage += error.message;
    } else {
      errorMessage += (error.message || 'Errore di connessione al database');
    }
    
    alert(errorMessage);
    
    // NON ricaricare la pagina in caso di errore per evitare loop
    console.log('⚠️ Salvataggio fallito - modale rimane aperto per correzioni');
  }
}

async function eliminaTimbrature(data, pin) {
  try {
    console.log('🗑️ Eliminazione timbrature per:', { data, pin });
    
    const { error } = await supabaseClient
      .from('timbrature')
      .delete()
      .eq('pin', parseInt(pin))
      .eq('giornologico', data);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Timbrature eliminate con successo');
    alert('Timbrature eliminate con successo!');
    
    // Ricarica i dati
    setTimeout(() => {
      location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Errore nell\'eliminazione:', error);
    alert('Errore nell\'eliminazione: ' + (error.message || 'Errore sconosciuto'));
  }
}

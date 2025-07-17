
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
    
    // Prima elimina le timbrature esistenti per la data originale usando RPC o metodo alternativo
    if (dataOriginale) {
      try {
        // Cancellazione con query più specifica
        const { data: existingData, error: fetchError } = await supabaseClient
          .from('timbrature')
          .select('id')
          .eq('pin', parseInt(pin))
          .eq('giornologico', dataOriginale);
        
        if (fetchError) {
          console.warn('⚠️ Errore nel recupero timbrature esistenti:', fetchError);
        } else if (existingData && existingData.length > 0) {
          // Elimina una per una usando gli ID
          for (const record of existingData) {
            const { error: deleteError } = await supabaseClient
              .from('timbrature')
              .delete()
              .eq('id', record.id);
            
            if (deleteError) {
              console.warn('⚠️ Errore nella cancellazione timbratura ID:', record.id, deleteError);
            }
          }
        }
      } catch (deleteError) {
        console.warn('⚠️ Errore nella cancellazione delle timbrature esistenti:', deleteError);
      }
    }
    
    // Salva le nuove timbrature se presenti
    const timbratureDaInserire = [];
    
    if (oraEntrata && dataEntrata) {
      timbratureDaInserire.push({
        pin: parseInt(pin),
        tipo: 'entrata',
        data: dataEntrata,
        ore: oraEntrata + ':00',
        giornologico: dataEntrata,
        timestamp: new Date().toISOString()
      });
    }
    
    if (oraUscita && dataUscita) {
      timbratureDaInserire.push({
        pin: parseInt(pin),
        tipo: 'uscita',
        data: dataUscita,
        ore: oraUscita + ':00',
        giornologico: dataUscita,
        timestamp: new Date().toISOString()
      });
    }
    
    if (timbratureDaInserire.length > 0) {
      // Prova prima con upsert, poi con insert normale
      const { error: upsertError } = await supabaseClient
        .from('timbrature')
        .upsert(timbratureDaInserire, { 
          onConflict: 'pin,giornologico,tipo',
          ignoreDuplicates: false 
        });
      
      if (upsertError) {
        // Se upsert fallisce, prova insert normale
        const { error: insertError } = await supabaseClient
          .from('timbrature')
          .insert(timbratureDaInserire);
        
        if (insertError) {
          throw new Error(`Errore inserimento: ${insertError.message} (Code: ${insertError.code})`);
        }
      }
    }
    
    console.log('✅ Modifiche salvate con successo');
    alert('Modifiche salvate correttamente!');
    
    // Ricarica i dati
    setTimeout(() => {
      location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Errore nel salvataggio:', error);
    
    // Messaggio di errore più specifico
    let errorMessage = 'Errore nel salvataggio delle modifiche: ';
    if (error.message?.includes('permission')) {
      errorMessage += 'Permessi insufficienti. Contatta l\'amministratore.';
    } else if (error.message?.includes('duplicate')) {
      errorMessage += 'Timbratura già esistente per questa data.';
    } else {
      errorMessage += (error.message || 'Errore sconosciuto');
    }
    
    alert(errorMessage);
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
    
    // Ricarica i dati
    setTimeout(() => {
      location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Errore nell\'eliminazione:', error);
    alert('Errore nell\'eliminazione delle timbrature: ' + (error.message || 'Errore sconosciuto'));
  }
}


import { supabase, pingSupabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.info('[UTENTI] init DOMContentLoaded');
  console.time('[UTENTI] load');
  
  // Ping di test
  pingSupabase().then(info => console.debug('[SUPABASE] ping', info)).catch(()=>{});
  
  try {
    const { data, error, status } = await supabase
      .from('utenti')
      .select('*')
      .order('cognome', { ascending: true });

    if (error) {
      console.error('[UTENTI] supabase error', { status, error });
      // Messaggio non bloccante
      const box = document.querySelector('#error-utenti') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'error-utenti' }));
      box.textContent = 'Impossibile caricare gli utenti. Riprova.';
      box.style.cssText = 'position:fixed;bottom:12px;left:12px;background:#b91c1c;color:#fff;padding:8px 10px;border-radius:8px;z-index:9999;font-size:12px';
      return;
    }

    console.debug('[UTENTI] rows', data?.length ?? 0);
    
    // Usa la funzione di rendering esistente
    if (window.renderUtenti && typeof window.renderUtenti === 'function') {
      window.renderUtenti(data || []);
    } else {
      console.warn('[UTENTI] renderUtenti function not found');
    }
    
  } catch (e) {
    console.error('[UTENTI] exception', e);
  } finally {
    console.timeEnd('[UTENTI] load');
  }
});

// Export per uso manuale
window.loadUtenti = async function() {
  document.dispatchEvent(new Event('DOMContentLoaded'));
};

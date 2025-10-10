// Adapter offline-first per timbrature BadgeNode
// INSERT DIRETTO su tabella + coda locale con retry automatico

import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import type { PendingEvent, SyncResult, TimbraturaTipo } from '../../../shared/types/sync';
import { SyncDB } from '../offline/sync-db';
import { 
  SYNC_DB_NAME, 
  SYNC_DB_STORE, 
  SYNC_MAX_ATTEMPTS, 
  SYNC_RETRY_BACKOFF_MS
} from '../../../shared/constants/sync';

export class TimbratureInsertAdapter {
  private db = new SyncDB(SYNC_DB_NAME, SYNC_DB_STORE);
  private syncing = false;
  private onlineListenerBound = false;

  constructor() {
    this.bindOnlineListener();
  }

  private bindOnlineListener() {
    if (this.onlineListenerBound) return;
    this.onlineListenerBound = true;
    
    window.addEventListener('online', () => {
      console.log('🌐 [TimbratureSync] Connessione ripristinata, avvio sync');
      this.syncNow();
    });
    
    // Primo tentativo all'avvio
    setTimeout(() => this.syncNow(), 1000);
  }

  async insertNowOrEnqueue(params: { 
    pin: number; 
    tipo: TimbraturaTipo; 
    created_at?: string; 
    client_event_id?: string 
  }): Promise<SyncResult> {
    console.log('🚀 [TimbratureSync] insertNowOrEnqueue chiamato:', params);
    
    const client_event_id = params.client_event_id ?? uuidv4();
    const created_at = params.created_at ?? new Date().toISOString();
    
    const pending: PendingEvent = {
      client_event_id,
      pin: params.pin,
      tipo: params.tipo,
      created_at,
      attempts: 0,
      created_local_ts: Date.now(),
    };
    

    // Tenta invio immediato se online
    if (navigator.onLine) {
      const result = await this.trySend(pending);
      if (result.success) {
        return { ok: true, client_event_id };
      }
    }

    // Accoda per retry successivo
    await this.db.put(pending);
    return { ok: false, client_event_id };
  }

  private async trySend(ev: PendingEvent): Promise<{ success: boolean; error?: string }> {
    try {
      
      // Calcola campi temporali (simula trigger server)
      const dt = new Date(ev.created_at);
      const rome = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(dt);
      
      const [dataLocale, oraLocale] = rome.split(' ');
      const oraNum = parseInt(oraLocale.split(':')[0]);
      
      // Giorno logico: se ora < 06:00 → giorno precedente
      let giornoLogico = dataLocale;
      if (oraNum < 6) {
        const prev = new Date(dataLocale + 'T00:00:00');
        prev.setDate(prev.getDate() - 1);
        giornoLogico = prev.toISOString().split('T')[0];
      }
      
      // INSERT DIRETTO su tabella timbrature con campi calcolati
      const { data, error } = await supabase
        .from('timbrature')
        .insert([{
          pin: ev.pin,
          tipo: ev.tipo,
          created_at: ev.created_at,
          client_event_id: ev.client_event_id,
          data_locale: dataLocale,
          ora_locale: oraLocale,
          giorno_logico: giornoLogico,
          ts_order: ev.created_at
        }])
        .select()
        .single();
      

      if (error) {
        // Errori idempotenza: duplicate key su client_event_id = successo
        const msg = (error.message || '').toLowerCase();
        const isConflict = msg.includes('duplicate') || 
                          msg.includes('unique') || 
                          msg.includes('ux_timbrature_client_event_id') ||
                          msg.includes('already exists');
        
        if (isConflict) {
          await this.db.delete(ev.client_event_id);
          return { success: true };
        }

        // Altri errori: incrementa attempts e conserva
        ev.attempts += 1;
        ev.last_error = error.message ?? String(error);
        await this.db.put(ev);
        return { success: false, error: error.message };
      }

      // Successo: rimuovi dalla coda
      if (data) {
        await this.db.delete(ev.client_event_id);
        return { success: true };
      }

      return { success: false, error: 'No data returned' };
      
    } catch (error) {
      // Errori di rete/connessione
      ev.attempts += 1;
      ev.last_error = error instanceof Error ? error.message : String(error);
      await this.db.put(ev);
      return { success: false, error: ev.last_error };
    }
  }

  async syncNow(): Promise<void> {
    if (this.syncing) return;
    
    this.syncing = true;
    try {
      const pending = await this.db.all<PendingEvent>();
      console.log(`🔄 [TimbratureSync] Avvio sync: ${pending.length} eventi in coda`);
      
      for (const ev of pending) {
        if (ev.attempts >= SYNC_MAX_ATTEMPTS) {
          console.error('❌ [TimbratureSync] Max attempts raggiunto:', ev.client_event_id);
          continue;
        }
        
        if (!navigator.onLine) {
          console.log('📴 [TimbratureSync] Offline, interrompo sync');
          break;
        }

        const result = await this.trySend(ev);
        
        if (!result.success) {
          // Backoff prima del prossimo tentativo
          const delay = SYNC_RETRY_BACKOFF_MS[Math.min(ev.attempts - 1, SYNC_RETRY_BACKOFF_MS.length - 1)];
          console.log(`⏱️ [TimbratureSync] Retry ${ev.attempts}/${SYNC_MAX_ATTEMPTS} in ${delay}ms:`, ev.client_event_id);
          await new Promise(r => setTimeout(r, Math.min(delay, 5000))); // Max 5s per non bloccare
        }
      }
      
      const remaining = await this.db.count();
      if (remaining > 0) {
        console.log(`📋 [TimbratureSync] Sync completato, rimangono ${remaining} eventi`);
      } else {
        console.log('✅ [TimbratureSync] Coda svuotata completamente');
      }
      
    } finally {
      this.syncing = false;
    }
  }

  async getPendingCount(): Promise<number> {
    return this.db.count();
  }

  async clearPending(): Promise<void> {
    const pending = await this.db.all<PendingEvent>();
    for (const ev of pending) {
      await this.db.delete(ev.client_event_id);
    }
  }
}

// Cache service per ultima timbratura - supporto validazione offline
// Non-invasivo: aggiunge funzionalità senza modificare esistenti

interface UltimaTimbratura {
  pin: number;
  tipo: 'entrata' | 'uscita';
  giorno_logico: string;
  timestamp: number;
}

const CACHE_KEY = 'BADGENODE_ULTIMA_TIMBRATURA';
const CACHE_EXPIRY_HOURS = 24;

export class TimbratureCacheService {
  /**
   * Recupera ultima timbratura per PIN dalla cache locale
   * Fallback sicuro: ritorna null se cache non disponibile
   */
  static async getUltimaTimbratura(pin: number): Promise<UltimaTimbratura | null> {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: UltimaTimbratura[] = JSON.parse(cached);
      const userCache = data.find(item => item.pin === pin);
      
      if (!userCache) return null;

      // Verifica scadenza cache (24h)
      const now = Date.now();
      if (now - userCache.timestamp > CACHE_EXPIRY_HOURS * 60 * 60 * 1000) {
        // Cache scaduta - rimuovi entry
        await this.removeFromCache(pin);
        return null;
      }

      return userCache;
    } catch (error) {
      // Fallback sicuro: cache non disponibile
      if (import.meta.env.DEV) {
        console.debug('[TimbratureCache] getUltimaTimbratura failed:', (error as Error)?.message);
      }
      return null;
    }
  }

  /**
   * Aggiorna cache con nuova timbratura
   * Fallback sicuro: non blocca se cache non disponibile
   */
  static async updateCache(pin: number, tipo: 'entrata' | 'uscita', giorno_logico: string): Promise<void> {
    try {
      let data: UltimaTimbratura[] = [];
      
      const existing = localStorage.getItem(CACHE_KEY);
      if (existing) {
        data = JSON.parse(existing);
      }

      // Rimuovi entry esistente per questo PIN
      data = data.filter(item => item.pin !== pin);

      // Aggiungi nuova entry
      data.push({
        pin,
        tipo,
        giorno_logico,
        timestamp: Date.now()
      });

      // Mantieni solo ultimi 50 PIN per performance
      if (data.length > 50) {
        data = data.slice(-50);
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));

      if (import.meta.env.DEV) {
        console.debug('[TimbratureCache] Updated cache for PIN', pin, 'tipo:', tipo);
      }
    } catch (error) {
      // Fallback sicuro: cache update failed ma non blocca
      if (import.meta.env.DEV) {
        console.debug('[TimbratureCache] updateCache failed:', (error as Error)?.message);
      }
    }
  }

  /**
   * Rimuove entry dalla cache per PIN specifico
   */
  private static async removeFromCache(pin: number): Promise<void> {
    try {
      const existing = localStorage.getItem(CACHE_KEY);
      if (!existing) return;

      const data: UltimaTimbratura[] = JSON.parse(existing);
      const filtered = data.filter(item => item.pin !== pin);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
    } catch (error) {
      // Fallback sicuro
      if (import.meta.env.DEV) {
        console.debug('[TimbratureCache] removeFromCache failed:', (error as Error)?.message);
      }
    }
  }

  /**
   * Pulisce cache scaduta (chiamata periodica)
   */
  static async cleanExpiredCache(): Promise<void> {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return;

      const data: UltimaTimbratura[] = JSON.parse(cached);
      const now = Date.now();
      const expiry = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

      const valid = data.filter(item => now - item.timestamp <= expiry);
      
      if (valid.length !== data.length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(valid));
        if (import.meta.env.DEV) {
          console.debug('[TimbratureCache] Cleaned', data.length - valid.length, 'expired entries');
        }
      }
    } catch (error) {
      // Fallback sicuro
      if (import.meta.env.DEV) {
        console.debug('[TimbratureCache] cleanExpiredCache failed:', (error as Error)?.message);
      }
    }
  }
}

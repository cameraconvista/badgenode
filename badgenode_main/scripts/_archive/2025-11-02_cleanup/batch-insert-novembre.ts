#!/usr/bin/env tsx

/**
 * Script per inserimento timbrature novembre 2025 - PIN 04 Veronica Morandi
 * Usa endpoint server per garantire giorno logico e timezone corretti
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 4;

// Dati timbrature novembre 2025 da inserire
const timbrature = [
  // 02 Giov, 16:58 → 01:11 (+1)
  { date: '2025-11-02', time: '16:58', tipo: 'entrata' },
  { date: '2025-11-03', time: '01:11', tipo: 'uscita' },
  
  // 08 Merc, 17:05 → 00:09 (+1)  
  { date: '2025-11-08', time: '17:05', tipo: 'entrata' },
  { date: '2025-11-09', time: '00:09', tipo: 'uscita' },
  
  // 09 Giov, 17:02 → 01:31 (+1)
  { date: '2025-11-09', time: '17:02', tipo: 'entrata' },
  { date: '2025-11-10', time: '01:31', tipo: 'uscita' },
  
  // 13 Lune, 16:56 → 00:36 (+1)
  { date: '2025-11-13', time: '16:56', tipo: 'entrata' },
  { date: '2025-11-14', time: '00:36', tipo: 'uscita' },
  
  // 15 Merc, 16:58 → 00:24 (+1)
  { date: '2025-11-15', time: '16:58', tipo: 'entrata' },
  { date: '2025-11-16', time: '00:24', tipo: 'uscita' },
  
  // 19 Dome, 16:51 → 00:52 (+1)
  { date: '2025-11-19', time: '16:51', tipo: 'entrata' },
  { date: '2025-11-20', time: '00:52', tipo: 'uscita' },
  
  // 20 Lune, 17:00 → 01:06 (+1)
  { date: '2025-11-20', time: '17:00', tipo: 'entrata' },
  { date: '2025-11-21', time: '01:06', tipo: 'uscita' },
  
  // 21 Mart, 17:02 → 01:38 (+1)
  { date: '2025-11-21', time: '17:02', tipo: 'entrata' },
  { date: '2025-11-22', time: '01:38', tipo: 'uscita' },
  
  // 28 Mart, 16:57 → 01:07 (+1)
  { date: '2025-11-28', time: '16:57', tipo: 'entrata' },
  { date: '2025-11-29', time: '01:07', tipo: 'uscita' },
  
  // 29 Merc, 17:00 → 00:38 (+1)
  { date: '2025-11-29', time: '17:00', tipo: 'entrata' },
  { date: '2025-11-30', time: '00:38', tipo: 'uscita' }
];

async function insertTimbratura(date: string, time: string, tipo: string) {
  const timestamp = `${date}T${time}:00.000Z`;
  
  try {
    const response = await fetch(`${SERVER_URL}/api/timbrature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pin: PIN,
        tipo: tipo.toLowerCase(),
        ts: timestamp
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ ${date} ${time} ${tipo.toUpperCase()} → ID: ${result.data?.id}`);
      return { success: true, id: result.data?.id };
    } else {
      console.error(`❌ ${date} ${time} ${tipo.toUpperCase()} → ERROR: ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ ${date} ${time} ${tipo.toUpperCase()} → NETWORK ERROR: ${error}`);
    return { success: false, error: error };
  }
}

async function main() {
  console.log(`🚀 Inserimento timbrature novembre 2025 - PIN ${PIN} Veronica Morandi`);
  console.log(`📊 Totale timbrature da inserire: ${timbrature.length}`);
  console.log(`🔗 Server: ${SERVER_URL}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < timbrature.length; i++) {
    const { date, time, tipo } = timbrature[i];
    
    console.log(`[${i + 1}/${timbrature.length}] Inserimento ${date} ${time} ${tipo}...`);
    
    const result = await insertTimbratura(date, time, tipo);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Pausa breve tra le chiamate per evitare sovraccarico
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📈 RIEPILOGO INSERIMENTO NOVEMBRE 2025:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 INSERIMENTO NOVEMBRE COMPLETATO CON SUCCESSO!');
    console.log('');
    console.log('📋 PATTERN TURNI NOVEMBRE:');
    console.log('- 10 turni notturni (entrata sera → uscita mattina)');
    console.log('- Orari entrata: 16:51-17:05');
    console.log('- Orari uscita: 00:09-01:38 (giorno successivo)');
    console.log('- Durata media: ~7-8 ore per turno');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

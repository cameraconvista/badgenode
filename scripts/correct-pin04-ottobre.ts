#!/usr/bin/env tsx

/**
 * Script per reinserimento corretto PIN 04 - ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 4;

// Dati timbrature ottobre 2025 da inserire per PIN 04 (Veronica Morandi)
const timbrature = [
  // 02 Giov, 16:58 → 01:11 (+1)
  { date: '2025-10-02', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-03', time: '01:11', tipo: 'uscita' },
  
  // 08 Merc, 17:05 → 00:09 (+1)
  { date: '2025-10-08', time: '17:05', tipo: 'entrata' },
  { date: '2025-10-09', time: '00:09', tipo: 'uscita' },
  
  // 09 Giov, 17:02 → 01:31 (+1)
  { date: '2025-10-09', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-10', time: '01:31', tipo: 'uscita' },
  
  // 13 Lune, 16:56 → 00:36 (+1)
  { date: '2025-10-13', time: '16:56', tipo: 'entrata' },
  { date: '2025-10-14', time: '00:36', tipo: 'uscita' },
  
  // 15 Merc, 16:58 → 00:24 (+1)
  { date: '2025-10-15', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-16', time: '00:24', tipo: 'uscita' },
  
  // 19 Dome, 16:51 → 00:52 (+1)
  { date: '2025-10-19', time: '16:51', tipo: 'entrata' },
  { date: '2025-10-20', time: '00:52', tipo: 'uscita' },
  
  // 20 Lune, 17:00 → 01:06 (+1)
  { date: '2025-10-20', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-21', time: '01:06', tipo: 'uscita' },
  
  // 21 Mart, 17:02 → 01:38 (+1)
  { date: '2025-10-21', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-22', time: '01:38', tipo: 'uscita' },
  
  // 28 Mart, 16:57 → 01:07 (+1)
  { date: '2025-10-28', time: '16:57', tipo: 'entrata' },
  { date: '2025-10-29', time: '01:07', tipo: 'uscita' },
  
  // 29 Merc, 17:00 → 00:38 (+1)
  { date: '2025-10-29', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-30', time: '00:38', tipo: 'uscita' }
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
  console.log(`🚀 Reinserimento corretto PIN ${PIN} - ottobre 2025 (Veronica Morandi)`);
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
  console.log('📈 RIEPILOGO REINSERIMENTO PIN 04 OTTOBRE:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 REINSERIMENTO PIN 04 OTTOBRE COMPLETATO!');
    console.log('');
    console.log('📋 PATTERN CORRETTO PIN 04 OTTOBRE:');
    console.log('- 10 turni notturni (02, 08-09, 13, 15, 19-21, 28-29 ottobre)');
    console.log('- Orari entrata: 16:51-17:05');
    console.log('- Orari uscita: 00:09-01:38 (giorno successivo)');
    console.log('- Durata media: ~7-8 ore per turno');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Script per reinserimento corretto PIN 05 - ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 5;

// Dati timbrature ottobre 2025 da inserire per PIN 5
const timbrature = [
  // 16 Giov, 17:00 → 01:30 (+1)
  { date: '2025-10-16', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-17', time: '01:30', tipo: 'uscita' },
  
  // 17 Vene, 17:15 → 02:14 (+1)
  { date: '2025-10-17', time: '17:15', tipo: 'entrata' },
  { date: '2025-10-18', time: '02:14', tipo: 'uscita' },
  
  // 18 Saba, 17:03 → 02:28 (+1)
  { date: '2025-10-18', time: '17:03', tipo: 'entrata' },
  { date: '2025-10-19', time: '02:28', tipo: 'uscita' },
  
  // 23 Giov, 17:02 → 02:10 (+1)
  { date: '2025-10-23', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-24', time: '02:10', tipo: 'uscita' },
  
  // 24 Vene, 16:58 → 03:04 (+1)
  { date: '2025-10-24', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-25', time: '03:04', tipo: 'uscita' },
  
  // 25 Saba, 17:03 → 02:02 (+1)
  { date: '2025-10-25', time: '17:03', tipo: 'entrata' },
  { date: '2025-10-26', time: '02:02', tipo: 'uscita' },
  
  // 26 Dome, 17:09 → 00:49 (+1)
  { date: '2025-10-26', time: '17:09', tipo: 'entrata' },
  { date: '2025-10-27', time: '00:49', tipo: 'uscita' },
  
  // 27 Lune, 17:06 → 01:10 (+1)
  { date: '2025-10-27', time: '17:06', tipo: 'entrata' },
  { date: '2025-10-28', time: '01:10', tipo: 'uscita' }
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
  console.log(`🚀 Reinserimento corretto PIN ${PIN} - ottobre 2025`);
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
  console.log('📈 RIEPILOGO REINSERIMENTO PIN 05 OTTOBRE:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 REINSERIMENTO PIN 05 OTTOBRE COMPLETATO!');
    console.log('');
    console.log('📋 PATTERN CORRETTO PIN 05 OTTOBRE:');
    console.log('- 8 turni notturni (16-18, 23-27 ottobre)');
    console.log('- Orari entrata: 16:58-17:15');
    console.log('- Orari uscita: 00:49-03:04 (giorno successivo)');
    console.log('- Durata media: ~8-9 ore per turno');
    console.log('- Periodo intensivo: weekend 16-18 e settimana 23-27');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

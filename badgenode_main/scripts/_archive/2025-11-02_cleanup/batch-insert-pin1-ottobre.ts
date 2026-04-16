#!/usr/bin/env tsx

/**
 * Script per inserimento timbrature ottobre 2025 - PIN 1
 * Usa endpoint server per garantire giorno logico e timezone corretti
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 1;

// Dati timbrature ottobre 2025 da inserire per PIN 1
const timbrature = [
  // 01 Merc, 16:51 → 00:08 (+1)
  { date: '2025-10-01', time: '16:51', tipo: 'entrata' },
  { date: '2025-10-02', time: '00:08', tipo: 'uscita' },
  
  // 03 Vene, 18:47 → 02:29 (+1)
  { date: '2025-10-03', time: '18:47', tipo: 'entrata' },
  { date: '2025-10-04', time: '02:29', tipo: 'uscita' },
  
  // 05 Dome, 16:52 → 00:52 (+1)
  { date: '2025-10-05', time: '16:52', tipo: 'entrata' },
  { date: '2025-10-06', time: '00:52', tipo: 'uscita' },
  
  // 06 Lune, 16:55 → 01:01 (+1)
  { date: '2025-10-06', time: '16:55', tipo: 'entrata' },
  { date: '2025-10-07', time: '01:01', tipo: 'uscita' },
  
  // 07 Mart, 16:57 → 00:49 (+1)
  { date: '2025-10-07', time: '16:57', tipo: 'entrata' },
  { date: '2025-10-08', time: '00:49', tipo: 'uscita' },
  
  // 09 Giov, 16:58 → 01:31 (+1)
  { date: '2025-10-09', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-10', time: '01:31', tipo: 'uscita' },
  
  // 10 Vene, 18:48 → 02:15 (+1)
  { date: '2025-10-10', time: '18:48', tipo: 'entrata' },
  { date: '2025-10-11', time: '02:15', tipo: 'uscita' },
  
  // 13 Lune, 16:58 → 00:32 (+1)
  { date: '2025-10-13', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-14', time: '00:32', tipo: 'uscita' },
  
  // 14 Mart, 16:55 → 00:57 (+1)
  { date: '2025-10-14', time: '16:55', tipo: 'entrata' },
  { date: '2025-10-15', time: '00:57', tipo: 'uscita' },
  
  // 15 Merc, 17:20 → 00:21 (+1)
  { date: '2025-10-15', time: '17:20', tipo: 'entrata' },
  { date: '2025-10-16', time: '00:21', tipo: 'uscita' },
  
  // 17 Vene, 18:51 → 02:18 (+1)
  { date: '2025-10-17', time: '18:51', tipo: 'entrata' },
  { date: '2025-10-18', time: '02:18', tipo: 'uscita' },
  
  // 18 Saba, 18:42 → 02:26 (+1)
  { date: '2025-10-18', time: '18:42', tipo: 'entrata' },
  { date: '2025-10-19', time: '02:26', tipo: 'uscita' },
  
  // 21 Mart, 18:50 → 01:38 (+1)
  { date: '2025-10-21', time: '18:50', tipo: 'entrata' },
  { date: '2025-10-22', time: '01:38', tipo: 'uscita' },
  
  // 22 Merc, 16:56 → 00:39 (+1)
  { date: '2025-10-22', time: '16:56', tipo: 'entrata' },
  { date: '2025-10-23', time: '00:39', tipo: 'uscita' },
  
  // 24 Vene, 18:02 → 03:12 (+1)
  { date: '2025-10-24', time: '18:02', tipo: 'entrata' },
  { date: '2025-10-25', time: '03:12', tipo: 'uscita' },
  
  // 25 Saba, 18:50 → 02:04 (+1)
  { date: '2025-10-25', time: '18:50', tipo: 'entrata' },
  { date: '2025-10-26', time: '02:04', tipo: 'uscita' }
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
  console.log(`🚀 Inserimento timbrature ottobre 2025 - PIN ${PIN}`);
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
  console.log('📈 RIEPILOGO INSERIMENTO OTTOBRE 2025 - PIN 1:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 INSERIMENTO PIN 1 OTTOBRE COMPLETATO CON SUCCESSO!');
    console.log('');
    console.log('📋 PATTERN TURNI PIN 1 OTTOBRE:');
    console.log('- 16 turni notturni distribuiti nel mese');
    console.log('- Orari entrata: 16:51-18:51');
    console.log('- Orari uscita: 00:08-03:12 (giorno successivo)');
    console.log('- Durata media: ~7-9 ore per turno');
    console.log('- Giorni lavorativi: 01, 03, 05-07, 09-10, 13-15, 17-18, 21-22, 24-25');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

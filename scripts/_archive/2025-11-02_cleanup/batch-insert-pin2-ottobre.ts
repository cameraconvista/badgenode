#!/usr/bin/env tsx

/**
 * Script per inserimento timbrature ottobre 2025 - PIN 2
 * Usa endpoint server per garantire giorno logico e timezone corretti
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 2;

// Dati timbrature ottobre 2025 da inserire per PIN 2
const timbrature = [
  // 01 Merc, 16:59 → 00:07 (+1)
  { date: '2025-10-01', time: '16:59', tipo: 'entrata' },
  { date: '2025-10-02', time: '00:07', tipo: 'uscita' },
  
  // 02 Giov, 16:54 → 01:09 (+1)
  { date: '2025-10-02', time: '16:54', tipo: 'entrata' },
  { date: '2025-10-03', time: '01:09', tipo: 'uscita' },
  
  // 03 Vene, 18:54 → 02:25 (+1)
  { date: '2025-10-03', time: '18:54', tipo: 'entrata' },
  { date: '2025-10-04', time: '02:25', tipo: 'uscita' },
  
  // 04 Saba, 16:56 → 03:50 (+1)
  { date: '2025-10-04', time: '16:56', tipo: 'entrata' },
  { date: '2025-10-05', time: '03:50', tipo: 'uscita' },
  
  // 06 Lune, 16:57 → 01:02 (+1)
  { date: '2025-10-06', time: '16:57', tipo: 'entrata' },
  { date: '2025-10-07', time: '01:02', tipo: 'uscita' },
  
  // 07 Mart, 16:59 → 00:46 (+1)
  { date: '2025-10-07', time: '16:59', tipo: 'entrata' },
  { date: '2025-10-08', time: '00:46', tipo: 'uscita' },
  
  // 08 Merc, 17:05 → 00:06 (+1)
  { date: '2025-10-08', time: '17:05', tipo: 'entrata' },
  { date: '2025-10-09', time: '00:06', tipo: 'uscita' },
  
  // 10 Vene, 18:58 → 02:15 (+1)
  { date: '2025-10-10', time: '18:58', tipo: 'entrata' },
  { date: '2025-10-11', time: '02:15', tipo: 'uscita' },
  
  // 11 Saba, 18:57 → 02:22 (+1)
  { date: '2025-10-11', time: '18:57', tipo: 'entrata' },
  { date: '2025-10-12', time: '02:22', tipo: 'uscita' },
  
  // 13 Lune, 16:55 → 00:36 (+1)
  { date: '2025-10-13', time: '16:55', tipo: 'entrata' },
  { date: '2025-10-14', time: '00:36', tipo: 'uscita' },
  
  // 14 Mart, 16:58 → 00:57 (+1)
  { date: '2025-10-14', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-15', time: '00:57', tipo: 'uscita' },
  
  // 16 Giov, 18:59 → 01:22 (+1)
  { date: '2025-10-16', time: '18:59', tipo: 'entrata' },
  { date: '2025-10-17', time: '01:22', tipo: 'uscita' },
  
  // 18 Saba, 18:55 → 02:26 (+1)
  { date: '2025-10-18', time: '18:55', tipo: 'entrata' },
  { date: '2025-10-19', time: '02:26', tipo: 'uscita' },
  
  // 21 Mart, 16:56 → 01:42 (+1)
  { date: '2025-10-21', time: '16:56', tipo: 'entrata' },
  { date: '2025-10-22', time: '01:42', tipo: 'uscita' },
  
  // 22 Merc, 18:57 → 00:39 (+1)
  { date: '2025-10-22', time: '18:57', tipo: 'entrata' },
  { date: '2025-10-23', time: '00:39', tipo: 'uscita' },
  
  // 24 Vene, 19:00 → 03:09 (+1)
  { date: '2025-10-24', time: '19:00', tipo: 'entrata' },
  { date: '2025-10-25', time: '03:09', tipo: 'uscita' },
  
  // 25 Saba, 16:57 → 02:03 (+1)
  { date: '2025-10-25', time: '16:57', tipo: 'entrata' },
  { date: '2025-10-26', time: '02:03', tipo: 'uscita' },
  
  // 27 Lune, 17:00 → 01:18 (+1)
  { date: '2025-10-27', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-28', time: '01:18', tipo: 'uscita' },
  
  // 28 Mart, 17:01 → 01:01 (+1)
  { date: '2025-10-28', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-29', time: '01:01', tipo: 'uscita' },
  
  // 29 Merc, 17:01 → 00:38 (+1)
  { date: '2025-10-29', time: '17:01', tipo: 'entrata' },
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
  console.log('📈 RIEPILOGO INSERIMENTO OTTOBRE 2025 - PIN 2:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 INSERIMENTO PIN 2 OTTOBRE COMPLETATO CON SUCCESSO!');
    console.log('');
    console.log('📋 PATTERN TURNI PIN 2 OTTOBRE:');
    console.log('- 20 turni notturni distribuiti nel mese');
    console.log('- Orari entrata: 16:54-19:00');
    console.log('- Orari uscita: 00:06-03:50 (giorno successivo)');
    console.log('- Durata media: ~7-8 ore per turno');
    console.log('- Giorni lavorativi: 01-04, 06-08, 10-11, 13-14, 16, 18, 21-22, 24-25, 27-29');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

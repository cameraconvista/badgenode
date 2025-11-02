#!/usr/bin/env tsx

/**
 * Script per reinserimento corretto PIN 07 - ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 7;

// Dati timbrature ottobre 2025 da inserire per PIN 7
const timbrature = [
  // 01 Merc, 14:29 → 15:48 (stesso giorno)
  { date: '2025-10-01', time: '14:29', tipo: 'entrata' },
  { date: '2025-10-01', time: '15:48', tipo: 'uscita' },
  
  // 03 Vene, 17:01 → 02:23 (+1)
  { date: '2025-10-03', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-04', time: '02:23', tipo: 'uscita' },
  
  // 04 Saba, 19:32 → 03:51 (+1)
  { date: '2025-10-04', time: '19:32', tipo: 'entrata' },
  { date: '2025-10-05', time: '03:51', tipo: 'uscita' },
  
  // 05 Dome, 16:58 → 01:10 (+1)
  { date: '2025-10-05', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-06', time: '01:10', tipo: 'uscita' },
  
  // 06 Lune, 16:58 → 01:01 (+1)
  { date: '2025-10-06', time: '16:58', tipo: 'entrata' },
  { date: '2025-10-07', time: '01:01', tipo: 'uscita' },
  
  // 07 Mart, 17:01 → 00:46 (+1)
  { date: '2025-10-07', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-08', time: '00:46', tipo: 'uscita' },
  
  // 09 Giov, 10:52 → 13:10 (stesso giorno)
  { date: '2025-10-09', time: '10:52', tipo: 'entrata' },
  { date: '2025-10-09', time: '13:10', tipo: 'uscita' },
  
  // 10 Vene, 17:01 → 02:16 (+1)
  { date: '2025-10-10', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-11', time: '02:16', tipo: 'uscita' },
  
  // 11 Saba, 19:27 → 02:20 (+1)
  { date: '2025-10-11', time: '19:27', tipo: 'entrata' },
  { date: '2025-10-12', time: '02:20', tipo: 'uscita' },
  
  // 12 Dome, 16:59 → 01:01 (+1)
  { date: '2025-10-12', time: '16:59', tipo: 'entrata' },
  { date: '2025-10-13', time: '01:01', tipo: 'uscita' },
  
  // 13 Lune, 16:57 → 00:47 (+1)
  { date: '2025-10-13', time: '16:57', tipo: 'entrata' },
  { date: '2025-10-14', time: '00:47', tipo: 'uscita' },
  
  // 15 Merc, 11:59 → 13:49 (stesso giorno)
  { date: '2025-10-15', time: '11:59', tipo: 'entrata' },
  { date: '2025-10-15', time: '13:49', tipo: 'uscita' },
  
  // 16 Giov, 17:02 → 01:21 (+1)
  { date: '2025-10-16', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-17', time: '01:21', tipo: 'uscita' },
  
  // 17 Vene, 18:58 → 02:23 (+1)
  { date: '2025-10-17', time: '18:58', tipo: 'entrata' },
  { date: '2025-10-18', time: '02:23', tipo: 'uscita' },
  
  // 18 Saba, 19:31 → 02:34 (+1)
  { date: '2025-10-18', time: '19:31', tipo: 'entrata' },
  { date: '2025-10-19', time: '02:34', tipo: 'uscita' },
  
  // 19 Dome, 16:25 → 19:29 (stesso giorno)
  { date: '2025-10-19', time: '16:25', tipo: 'entrata' },
  { date: '2025-10-19', time: '19:29', tipo: 'uscita' },
  
  // 20 Lune, 17:00 → 01:15 (+1)
  { date: '2025-10-20', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-21', time: '01:15', tipo: 'uscita' },
  
  // 23 Giov, 16:59 → 02:11 (+1)
  { date: '2025-10-23', time: '16:59', tipo: 'entrata' },
  { date: '2025-10-24', time: '02:11', tipo: 'uscita' },
  
  // 24 Vene, 19:00 → 03:09 (+1)
  { date: '2025-10-24', time: '19:00', tipo: 'entrata' },
  { date: '2025-10-25', time: '03:09', tipo: 'uscita' },
  
  // 25 Saba, 19:27 → 02:10 (+1)
  { date: '2025-10-25', time: '19:27', tipo: 'entrata' },
  { date: '2025-10-26', time: '02:10', tipo: 'uscita' },
  
  // 26 Dome, 17:07 → 00:52 (+1)
  { date: '2025-10-26', time: '17:07', tipo: 'entrata' },
  { date: '2025-10-27', time: '00:52', tipo: 'uscita' },
  
  // 27 Lune, 16:33 → 01:21 (+1)
  { date: '2025-10-27', time: '16:33', tipo: 'entrata' },
  { date: '2025-10-28', time: '01:21', tipo: 'uscita' }
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
  console.log('📈 RIEPILOGO REINSERIMENTO PIN 07 OTTOBRE:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 REINSERIMENTO PIN 07 OTTOBRE COMPLETATO!');
    console.log('');
    console.log('📋 PATTERN CORRETTO PIN 07 OTTOBRE:');
    console.log('- Mix di turni diurni e notturni');
    console.log('- Turni diurni: 01, 09, 15, 19 ottobre');
    console.log('- Turni notturni: 03-07, 10-13, 16-18, 20, 23-27 ottobre');
    console.log('- Orari variabili: 10:52-19:32 (entrata), 13:10-03:51 (uscita)');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

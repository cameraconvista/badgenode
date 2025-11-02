#!/usr/bin/env tsx

/**
 * Script per inserimento batch timbrature PIN 04 - Veronica Morandi
 * Usa endpoint server per garantire giorno logico e timezone corretti
 */

import { config } from 'dotenv';
import path from 'path';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SERVER_URL = 'http://localhost:3001';
const PIN = 4;

// Dati timbrature da inserire
const timbrature = [
  // Settembre 2025
  { date: '2025-09-02', time: '17:07', tipo: 'entrata' },
  { date: '2025-09-03', time: '01:12', tipo: 'uscita' },
  { date: '2025-09-03', time: '16:59', tipo: 'entrata' },
  { date: '2025-09-04', time: '00:59', tipo: 'uscita' },
  { date: '2025-09-05', time: '18:56', tipo: 'entrata' },
  { date: '2025-09-06', time: '01:59', tipo: 'uscita' },
  { date: '2025-09-06', time: '17:01', tipo: 'entrata' },
  { date: '2025-09-07', time: '02:29', tipo: 'uscita' },
  { date: '2025-09-09', time: '17:16', tipo: 'entrata' },
  { date: '2025-09-10', time: '01:32', tipo: 'uscita' },
  { date: '2025-09-10', time: '16:58', tipo: 'entrata' },
  { date: '2025-09-11', time: '01:03', tipo: 'uscita' },
  { date: '2025-09-11', time: '18:05', tipo: 'entrata' },
  { date: '2025-09-12', time: '01:46', tipo: 'uscita' },
  { date: '2025-09-12', time: '18:03', tipo: 'entrata' },
  { date: '2025-09-13', time: '01:19', tipo: 'uscita' },
  { date: '2025-09-13', time: '17:16', tipo: 'entrata' },
  { date: '2025-09-14', time: '02:27', tipo: 'uscita' },
  { date: '2025-09-16', time: '17:16', tipo: 'entrata' },
  { date: '2025-09-17', time: '01:02', tipo: 'uscita' },
  { date: '2025-09-17', time: '17:01', tipo: 'entrata' },
  { date: '2025-09-18', time: '01:16', tipo: 'uscita' },
  { date: '2025-09-18', time: '18:00', tipo: 'entrata' },
  { date: '2025-09-19', time: '02:30', tipo: 'uscita' },
  { date: '2025-09-19', time: '17:18', tipo: 'entrata' },
  { date: '2025-09-20', time: '02:22', tipo: 'uscita' },
  { date: '2025-09-20', time: '17:01', tipo: 'entrata' },
  { date: '2025-09-21', time: '02:04', tipo: 'uscita' },
  { date: '2025-09-23', time: '17:03', tipo: 'entrata' },
  { date: '2025-09-24', time: '01:11', tipo: 'uscita' },
  { date: '2025-09-24', time: '17:09', tipo: 'entrata' },
  { date: '2025-09-25', time: '01:30', tipo: 'uscita' },
  { date: '2025-09-25', time: '18:00', tipo: 'entrata' },
  { date: '2025-09-26', time: '01:56', tipo: 'uscita' },
  { date: '2025-09-27', time: '17:08', tipo: 'entrata' },
  { date: '2025-09-28', time: '02:15', tipo: 'uscita' },
  { date: '2025-09-28', time: '18:00', tipo: 'entrata' },
  { date: '2025-09-29', time: '01:48', tipo: 'uscita' },

  // Ottobre 2025
  { date: '2025-10-01', time: '17:03', tipo: 'entrata' },
  { date: '2025-10-02', time: '00:55', tipo: 'uscita' },
  { date: '2025-10-02', time: '17:11', tipo: 'entrata' },
  { date: '2025-10-03', time: '00:53', tipo: 'uscita' },
  { date: '2025-10-03', time: '18:00', tipo: 'entrata' },
  { date: '2025-10-04', time: '01:57', tipo: 'uscita' },
  { date: '2025-10-04', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-05', time: '01:58', tipo: 'uscita' },
  { date: '2025-10-05', time: '17:14', tipo: 'entrata' },
  { date: '2025-10-06', time: '01:25', tipo: 'uscita' },
  { date: '2025-10-06', time: '17:04', tipo: 'entrata' },
  { date: '2025-10-07', time: '00:54', tipo: 'uscita' },
  { date: '2025-10-08', time: '17:10', tipo: 'entrata' },
  { date: '2025-10-09', time: '00:59', tipo: 'uscita' },
  { date: '2025-10-09', time: '17:09', tipo: 'entrata' },
  { date: '2025-10-10', time: '01:24', tipo: 'uscita' },
  { date: '2025-10-10', time: '17:04', tipo: 'entrata' },
  { date: '2025-10-11', time: '01:03', tipo: 'uscita' },
  { date: '2025-10-11', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-12', time: '01:22', tipo: 'uscita' },
  { date: '2025-10-12', time: '17:07', tipo: 'entrata' },
  { date: '2025-10-13', time: '01:11', tipo: 'uscita' },
  { date: '2025-10-13', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-14', time: '00:54', tipo: 'uscita' },
  { date: '2025-10-15', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-16', time: '00:58', tipo: 'uscita' },
  { date: '2025-10-16', time: '18:03', tipo: 'entrata' },
  { date: '2025-10-17', time: '01:38', tipo: 'uscita' },
  { date: '2025-10-17', time: '17:05', tipo: 'entrata' },
  { date: '2025-10-18', time: '01:43', tipo: 'uscita' },
  { date: '2025-10-18', time: '17:02', tipo: 'entrata' },
  { date: '2025-10-19', time: '01:36', tipo: 'uscita' },
  { date: '2025-10-19', time: '17:01', tipo: 'entrata' },
  { date: '2025-10-20', time: '01:39', tipo: 'uscita' },
  { date: '2025-10-20', time: '17:06', tipo: 'entrata' },
  { date: '2025-10-21', time: '01:49', tipo: 'uscita' },
  { date: '2025-10-21', time: '17:10', tipo: 'entrata' },
  { date: '2025-10-22', time: '01:41', tipo: 'uscita' },
  { date: '2025-10-22', time: '18:00', tipo: 'entrata' },
  { date: '2025-10-23', time: '01:45', tipo: 'uscita' },
  { date: '2025-10-23', time: '17:04', tipo: 'entrata' },
  { date: '2025-10-24', time: '01:52', tipo: 'uscita' },
  { date: '2025-10-25', time: '17:05', tipo: 'entrata' },
  { date: '2025-10-26', time: '01:57', tipo: 'uscita' },
  { date: '2025-10-26', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-27', time: '01:43', tipo: 'uscita' },
  { date: '2025-10-27', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-28', time: '01:36', tipo: 'uscita' },
  { date: '2025-10-28', time: '17:09', tipo: 'entrata' },
  { date: '2025-10-29', time: '01:48', tipo: 'uscita' },
  { date: '2025-10-29', time: '17:00', tipo: 'entrata' },
  { date: '2025-10-30', time: '01:51', tipo: 'uscita' },
  { date: '2025-10-30', time: '17:07', tipo: 'entrata' },
  { date: '2025-10-31', time: '01:58', tipo: 'uscita' }
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
  console.log(`🚀 Inserimento batch timbrature PIN ${PIN} - Veronica Morandi`);
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
  console.log('📈 RIEPILOGO INSERIMENTO:');
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📊 Totale: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 INSERIMENTO COMPLETATO CON SUCCESSO!');
  } else {
    console.log('⚠️  Alcuni inserimenti sono falliti. Verificare i log sopra.');
  }
}

// Esegui lo script
main().catch(console.error);

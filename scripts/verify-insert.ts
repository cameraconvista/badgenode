#!/usr/bin/env tsx

/**
 * Script per verificare l'inserimento delle timbrature PIN 04
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyInsert() {
  console.log('🔍 Verifica inserimento timbrature PIN 04...');
  
  try {
    // Count totale timbrature PIN 04
    const { data: countData, error: countError } = await supabase
      .from('timbrature')
      .select('*', { count: 'exact', head: true })
      .eq('pin', 4);

    if (countError) {
      throw countError;
    }

    console.log(`📊 Totale timbrature PIN 04: ${countData?.length || 0}`);

    // Ultime 10 timbrature
    const { data: recentData, error: recentError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico, created_at')
      .eq('pin', 4)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      throw recentError;
    }

    console.log('\n📋 Ultime 10 timbrature:');
    recentData?.forEach((t, i) => {
      console.log(`${i + 1}. ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale} (giorno logico: ${t.giorno_logico})`);
    });

    // Verifica giorno logico per timbrature notturne
    console.log('\n🌙 Verifica giorno logico per timbrature notturne (00:00-04:59):');
    
    const { data: nightData, error: nightError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 4)
      .gte('ora_locale', '00:00:00')
      .lt('ora_locale', '05:00:00')
      .order('data_locale', { ascending: false })
      .limit(10);

    if (nightError) {
      throw nightError;
    }

    nightData?.forEach((t, i) => {
      const dataDate = new Date(t.data_locale);
      const giornoLogicoDate = new Date(t.giorno_logico);
      const diffDays = Math.floor((dataDate.getTime() - giornoLogicoDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`${i + 1}. ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale} → giorno logico: ${t.giorno_logico} (diff: ${diffDays} giorni)`);
    });

    console.log('\n✅ Verifica completata!');

  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
  }
}

verifyInsert().catch(console.error);

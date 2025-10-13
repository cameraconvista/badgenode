#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('🔍 Ispezione Schema Database\n');

  // 1. Verifica struttura tabella timbrature
  const { data, error } = await supabase
    .from('timbrature')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Errore accesso timbrature:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Colonne tabella timbrature:');
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]} (${data[0][col]})`);
    });
  }

  // 2. Verifica dati recenti
  console.log('\n📊 Ultimi 5 record timbrature:');
  const { data: recent, error: recentError } = await supabase
    .from('timbrature')
    .select('*')
    .order('ts_order', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('❌ Errore query recenti:', recentError);
  } else {
    recent.forEach((row, i) => {
      console.log(`\n  Record ${i + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    });
  }
}

inspectSchema().catch(console.error);

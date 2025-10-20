// Cleanup dati di test per sviluppo Supabase
// Rimuove solo record con seed_dev=true

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carica env vars
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cleanup script disabled in production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanupDevData() {
  console.log('🧹 Starting development data cleanup...');

  try {
    // 1. Cleanup timbrature di test (by client_event_id pattern)
    console.log('⏰ Cleaning test timbrature...');
    const { data: timbratureData, error: timbratureError } = await supabase
      .from('timbrature')
      .delete()
      .like('client_event_id', 'seed_dev_%')
      .select('id, pin, tipo');

    if (timbratureError) {
      console.error('❌ Error cleaning timbrature:', timbratureError);
    } else {
      console.log(`✅ Timbrature cleaned: ${timbratureData?.length || 0} records`);
    }

    // 2. Cleanup utenti di test (by note field)
    console.log('👥 Cleaning test users...');
    const { data: utentiData, error: utentiError } = await supabase
      .from('utenti')
      .delete()
      .eq('note', 'seed_dev=true')
      .select('id, pin, nome, cognome');

    if (utentiError) {
      console.error('❌ Error cleaning users:', utentiError);
    } else {
      console.log(`✅ Users cleaned: ${utentiData?.length || 0} records`);
    }

    console.log('\n🎉 Development cleanup completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Timbrature removed: ${timbratureData?.length || 0}`);
    console.log(`   - Users removed: ${utentiData?.length || 0}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Execute cleanup
cleanupDevData();

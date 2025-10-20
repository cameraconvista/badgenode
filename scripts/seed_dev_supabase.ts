// Seed dati di test per sviluppo Supabase
// Usa SERVICE_ROLE_KEY per bypassare RLS

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
  console.error('❌ Seed script disabled in production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedDevData() {
  console.log('🌱 Starting development seed...');

  try {
    // 1. Seed utenti di test
    const utentiTest = [
      {
        pin: 1,
        nome: 'Mario',
        cognome: 'Rossi',
        ore_contrattuali: 8.0,
        email: 'mario.rossi@test.dev',
        telefono: '123-456-7890',
        created_at: new Date().toISOString(),
        // Meta per identificare record di test
        note: 'seed_dev=true'
      },
      {
        pin: 2,
        nome: 'Luigi',
        cognome: 'Verdi',
        ore_contrattuali: 8.0,
        email: 'luigi.verdi@test.dev',
        telefono: '098-765-4321',
        created_at: new Date().toISOString(),
        note: 'seed_dev=true'
      }
    ];

    console.log('👥 Inserting test users...');
    const { data: utentiData, error: utentiError } = await supabase
      .from('utenti')
      .upsert(utentiTest, { onConflict: 'pin' })
      .select('id, pin, nome, cognome');

    if (utentiError) {
      console.error('❌ Error inserting users:', utentiError);
      return;
    }

    console.log('✅ Users inserted:', utentiData);

    // 2. Seed timbrature di test (alternanza corretta)
    const oggi = new Date().toISOString().split('T')[0];
    const ieri = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const timbratureTest = [
      // Mario - ieri
      {
        pin: 1,
        tipo: 'entrata',
        data_locale: ieri,
        ora_locale: '09:00:00',
        giorno_logico: ieri,
        ts_order: `${ieri}T09:00:00.000Z`,
        client_event_id: `seed_dev_${ieri}_1_entrata`,
        created_at: new Date().toISOString()
      },
      {
        pin: 1,
        tipo: 'uscita',
        data_locale: ieri,
        ora_locale: '17:30:00',
        giorno_logico: ieri,
        ts_order: `${ieri}T17:30:00.000Z`,
        client_event_id: `seed_dev_${ieri}_1_uscita`,
        created_at: new Date().toISOString()
      },
      // Luigi - oggi
      {
        pin: 2,
        tipo: 'entrata',
        data_locale: oggi,
        ora_locale: '08:30:00',
        giorno_logico: oggi,
        ts_order: `${oggi}T08:30:00.000Z`,
        client_event_id: `seed_dev_${oggi}_2_entrata`,
        created_at: new Date().toISOString()
      }
    ];

    console.log('⏰ Inserting test timbrature...');
    const { data: timbratureData, error: timbratureError } = await supabase
      .from('timbrature')
      .upsert(timbratureTest, { onConflict: 'client_event_id' })
      .select('id, pin, tipo, data_locale, ora_locale');

    if (timbratureError) {
      console.error('❌ Error inserting timbrature:', timbratureError);
      return;
    }

    console.log('✅ Timbrature inserted:', timbratureData);

    console.log('\n🎉 Development seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${utentiData?.length || 0}`);
    console.log(`   - Timbrature: ${timbratureData?.length || 0}`);
    console.log('\n🧹 To cleanup: npm run seed:dev:clean');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Execute seed
seedDevData();

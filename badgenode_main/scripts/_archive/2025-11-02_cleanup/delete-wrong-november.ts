#!/usr/bin/env tsx

/**
 * Script per eliminare le timbrature novembre inserite erroneamente
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteWrongNovember() {
  console.log('🗑️  Eliminazione timbrature novembre errate...');
  
  try {
    // Elimina PIN 04 novembre
    console.log('\n🗑️  Eliminazione PIN 04 novembre...');
    const { data: deleted04, error: error04 } = await supabase
      .from('timbrature')
      .delete()
      .eq('pin', 4)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .select('id');

    if (error04) throw error04;
    console.log(`✅ Eliminati ${deleted04?.length || 0} record PIN 04`);

    // Elimina PIN 05 novembre
    console.log('\n🗑️  Eliminazione PIN 05 novembre...');
    const { data: deleted05, error: error05 } = await supabase
      .from('timbrature')
      .delete()
      .eq('pin', 5)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .select('id');

    if (error05) throw error05;
    console.log(`✅ Eliminati ${deleted05?.length || 0} record PIN 05`);

    // Elimina PIN 07 novembre
    console.log('\n🗑️  Eliminazione PIN 07 novembre...');
    const { data: deleted07, error: error07 } = await supabase
      .from('timbrature')
      .delete()
      .eq('pin', 7)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .select('id');

    if (error07) throw error07;
    console.log(`✅ Eliminati ${deleted07?.length || 0} record PIN 07`);

    const totalDeleted = (deleted04?.length || 0) + (deleted05?.length || 0) + (deleted07?.length || 0);
    console.log(`\n📊 Totale eliminazioni: ${totalDeleted} record`);

    console.log('\n✅ Eliminazione completata!');

  } catch (error) {
    console.error('❌ Errore durante eliminazione:', error);
  }
}

deleteWrongNovember().catch(console.error);

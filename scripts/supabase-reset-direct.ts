// Script diretto per reset Supabase - esegue operazioni una per una
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Mancano variabili ambiente');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('🚀 BADGENODE STEP 2: Reset Supabase (approccio diretto)');
  
  try {
    // Test connessione
    console.log('\n🔍 Test connessione...');
    const { data: testData, error: testError } = await supabase
      .from('utenti')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('📊 Tabella utenti non esiste ancora o errore:', testError.message);
    } else {
      console.log('✅ Connessione OK, utenti esistenti:', testData);
    }
    
    // Seed utenti (idempotente)
    console.log('\n🌱 Seed utenti...');
    const { data: seedData, error: seedError } = await supabase
      .from('utenti')
      .upsert([
        { pin: 1, nome: 'Mario', cognome: 'Rossi' },
        { pin: 2, nome: 'Luisa', cognome: 'Bianchi' },
        { pin: 3, nome: 'Test', cognome: 'User' }
      ], { 
        onConflict: 'pin',
        ignoreDuplicates: true 
      });
    
    if (seedError) {
      console.error('❌ Errore seed:', seedError);
    } else {
      console.log('✅ Seed completato:', seedData);
    }
    
    // Test RPC insert_timbro_v2
    console.log('\n🧪 Test RPC insert_timbro_v2...');
    
    // Test 1: Entrata valida
    try {
      const { data: entrata, error: entrataError } = await supabase
        .rpc('insert_timbro_v2', { p_pin: 1, p_tipo: 'entrata' });
      
      if (entrataError) {
        console.error('❌ Errore entrata:', entrataError);
      } else {
        console.log('✅ Entrata registrata:', entrata);
      }
    } catch (error) {
      console.error('❌ Eccezione entrata:', error);
    }
    
    // Test 2: Uscita valida
    try {
      const { data: uscita, error: uscitaError } = await supabase
        .rpc('insert_timbro_v2', { p_pin: 1, p_tipo: 'uscita' });
      
      if (uscitaError) {
        console.error('❌ Errore uscita:', uscitaError);
      } else {
        console.log('✅ Uscita registrata:', uscita);
      }
    } catch (error) {
      console.error('❌ Eccezione uscita:', error);
    }
    
    // Test 3: PIN inesistente (deve fallire)
    try {
      const { data: pinError, error: pinErrorResult } = await supabase
        .rpc('insert_timbro_v2', { p_pin: 99, p_tipo: 'entrata' });
      
      if (pinErrorResult) {
        console.log('✅ PIN inesistente correttamente bloccato:', pinErrorResult.message);
      } else {
        console.error('❌ PIN inesistente NON bloccato!');
      }
    } catch (error) {
      console.log('✅ PIN inesistente bloccato con eccezione:', error);
    }
    
    // Verifica finale
    console.log('\n📊 Verifica finale...');
    const { data: timbrature, error: timbratureError } = await supabase
      .from('timbrature')
      .select('*')
      .eq('pin', 1)
      .order('ts_order', { ascending: true });
    
    if (timbratureError) {
      console.error('❌ Errore lettura timbrature:', timbratureError);
    } else {
      console.log('✅ Timbrature registrate:', timbrature);
    }
    
    console.log('\n🎉 Test completati!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
    process.exit(1);
  }
}

main();

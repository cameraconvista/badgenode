// Realtime adapter - any confinato qui per Supabase Realtime API
import { supabase } from './supabaseAdapter';
import { asError } from '@/lib/safeError';

// Tipo per handler - any necessario per payload Supabase Realtime
type RealtimeChangeHandler = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any; // Supabase payload structure
  old?: any; // Supabase payload structure
}) => void;

export function subscribeTimbrature(params: { pin?: number; onChange: RealtimeChangeHandler }) {
  const { pin, onChange } = params;

  const channel = supabase.channel(pin ? `timbrature:pin:${pin}` : 'timbrature:all', {
    config: { broadcast: { ack: true }, presence: { key: 'badgenode' } },
  });

  // any necessario per Supabase Realtime payload structure
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'timbrature' }, (payload: any) => {
    onChange({ eventType: payload.eventType, new: payload.new, old: payload.old });
  }).subscribe((_status: any, e: any) => {
    if (e) {
      const err = asError(e);
      console.error('[BadgeNode] Realtime subscription error:', err.message);
    }
  });

  channel.subscribe((_status: any) => {
    // Status handler - any necessario per Supabase API signature
  });

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (error) {
      // Ignore cleanup errors
    }
  };
}

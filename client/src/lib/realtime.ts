import { supabase } from '@/lib/supabaseClient';

type ChangeHandler = (payload: { type: 'INSERT'|'UPDATE'|'DELETE', new?: any, old?: any }) => void;

export function subscribeTimbrature(params: { pin?: number; onChange: ChangeHandler }) {
  const { pin, onChange } = params;

  const channel = supabase.channel(
    pin ? `timbrature:pin:${pin}` : 'timbrature:all',
    { config: { broadcast: { ack: true }, presence: { key: 'badgenode' } } }
  );

  const filter = pin ? `pin=eq.${pin}` : undefined;

  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'timbrature', filter },
    (payload: any) => {
      const { eventType, new: rowNew, old: rowOld } = payload;
      console.debug('📡 Realtime event:', { eventType, pin: rowNew?.pin || rowOld?.pin, filter });
      onChange({ type: eventType as any, new: rowNew, old: rowOld });
    }
  );

  channel.subscribe((status) => {
    console.debug('📡 Realtime status:', status, { scope: filter ?? 'ALL' });
  });

  return () => {
    try { 
      supabase.removeChannel(channel);
      console.debug('📡 Realtime unsubscribed:', { scope: filter ?? 'ALL' });
    } catch (error) {
      console.warn('📡 Error unsubscribing:', error);
    }
  };
}

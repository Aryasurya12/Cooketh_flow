import { createClient } from '@supabase/supabase-js';

// NOTE: These should be in environment variables. 
// For demo purposes, we are checking if they exist.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseKey;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const RealtimeService = {
  isAvailable: () => !!supabase,

  // Subscribe to presence (cursors) and database changes
  subscribeToMap: (mapId: string, onSync: (payload: any) => void, onCursor: (payload: any) => void) => {
    if (!supabase) return null;

    const channel = supabase.channel(`map:${mapId}`, {
      config: {
        presence: {
          key: mapId,
        },
      },
    });

    channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => onCursor(payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes', filter: `map_id=eq.${mapId}` }, onSync)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'edges', filter: `map_id=eq.${mapId}` }, onSync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
           // const presenceTrackStatus = await channel.track(userStatus);
        }
      });

    return channel;
  },

  sendCursor: (channel: any, cursor: any) => {
    if (!channel) return;
    channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: cursor,
    });
  }
};
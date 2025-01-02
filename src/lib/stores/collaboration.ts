import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export async function setupCollaboration(mindmapId: string): Promise<RealtimeChannel> {
  const channel = supabase.channel(`mindmap:${mindmapId}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('Presence sync');
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Leave:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user: 'online' });
      }
    });

  return channel;
} 
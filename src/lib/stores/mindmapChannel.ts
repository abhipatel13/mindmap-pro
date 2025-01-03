import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Node } from '../types';

export function createMindmapChannel(mindmapId: string, callbacks: {
  onNodeMove: (node: Node) => void;
  onNodeUpdate: (node: Node) => void;
  onNodeAdd: (node: Node) => void;
  onNodeDelete: (nodeId: string) => void;
  onUserCursor?: (data: { userId: string; x: number; y: number }) => void;
}): RealtimeChannel {
  const channel = supabase.channel(`mindmap:${mindmapId}`);

  channel
    .on('broadcast', { event: 'node_move' }, ({ payload }) => {
      console.log('Node move received:', payload);
      callbacks.onNodeMove(payload);
    })
    .on('broadcast', { event: 'node_update' }, ({ payload }) => {
      console.log('Node update received:', payload);
      callbacks.onNodeUpdate(payload);
    })
    .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      callbacks.onUserCursor?.(payload);
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'mindmap_nodes',
      filter: `mindmap_id=eq.${mindmapId}`
    }, (payload) => {
      console.log('Database change:', payload);
      switch (payload.eventType) {
        case 'INSERT':
          const newNode = {
            ...payload.new,
            x: payload.new.position_x || Math.random() * 800,
            y: payload.new.position_y || Math.random() * 600
          } as Node;
          callbacks.onNodeAdd(newNode);
          break;
        case 'UPDATE':
          const updatedNode = {
            ...payload.new,
            x: payload.new.position_x,
            y: payload.new.position_y
          } as Node;
          callbacks.onNodeUpdate(updatedNode);
          break;
        case 'DELETE':
          callbacks.onNodeDelete(payload.old.id);
          break;
      }
    });

  return channel;
} 
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Node } from '../types';

interface WebSocketMessage {
  type: 'node_move' | 'node_update' | 'node_add' | 'node_delete' | 'cursor_move';
  payload: any;
  userId: string;
  mindmapId: string;
  timestamp: number;
}

export async function createMindmapWebSocket(mindmapId: string, callbacks: {
  onNodeMove: (node: Node) => void;
  onNodeUpdate: (node: Node) => void;
  onNodeAdd: (node: Node) => void;
  onNodeDelete: (nodeId: string) => void;
  onUserCursor?: (data: { userId: string; x: number; y: number }) => void;
  onUserJoin?: (userId: string) => void;
  onUserLeave?: (userId: string) => void;
}): Promise<RealtimeChannel> {
  const userId = await getUserId();
  
  const channel = supabase.channel(`mindmap:${mindmapId}`, {
    config: {
      broadcast: { ack: true },
      presence: { key: userId }
    }
  });

  channel
    .on('broadcast', { event: 'node_move' }, ({ payload }) => {
      if (payload.userId !== userId) {
        callbacks.onNodeMove(payload);
      }
    })
    .on('broadcast', { event: 'node_update' }, ({ payload }) => {
      if (payload.userId !== userId) {
        callbacks.onNodeUpdate(payload);
      }
    })
    .on('broadcast', { event: 'node_add' }, ({ payload }) => {
      if (payload.userId !== userId) {
        callbacks.onNodeAdd(payload);
      }
    })
    .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      if (payload.userId !== userId) {
        callbacks.onUserCursor?.(payload);
      }
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'mindmap_nodes',
      filter: `mindmap_id=eq.${mindmapId}`
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        callbacks.onNodeAdd(payload.new as Node);
      } else if (payload.eventType === 'UPDATE') {
        callbacks.onNodeUpdate(payload.new as Node);
      } else if (payload.eventType === 'DELETE') {
        callbacks.onNodeDelete(payload.old.id);
      }
    });

  await channel.subscribe();
  return channel;
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || 'anonymous';
}

export function sendWebSocketMessage(
  channel: RealtimeChannel, 
  type: WebSocketMessage['type'], 
  payload: any,
  userId: string,
  mindmapId: string
): void {
  channel.send({
    type: 'broadcast',
    event: type,
    payload: {
      ...payload,
      userId,
      mindmapId,
      timestamp: Date.now()
    }
  });
} 
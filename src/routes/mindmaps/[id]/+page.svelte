<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import MindMap from '$lib/components/MindMap.svelte';
  import type { Node, Link, MindMap as MindMapType } from '$lib/types';
  import InviteUsers from '$lib/components/InviteUsers.svelte';
  import { goto } from '$app/navigation';

  const mindmapId = $page.params.id;
  let mindmap: MindMapType | null = null;
  let nodes: Node[] = [];
  let links: Link[] = [];
  let newNodeContent = '';
  let selectedNodeId: string | null = null;
  let error = '';
  let isOwner = false;

  async function loadMindmap() {
    try {
      
      // Load mindmap details
      const { data: mindmapData, error: mindmapError } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('id', mindmapId)
        .single();

      if (mindmapError) {
        console.error('Mindmap error:', mindmapError);
        throw mindmapError;
      }
      mindmap = mindmapData;

      // Load nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('mindmap_nodes')
        .select('*')
        .eq('mindmap_id', mindmapId);

      if (nodesError) {
        console.error('Nodes error:', nodesError);
        throw nodesError;
      }
      nodes = nodesData || [];

      // Create links from parent-child relationships
      links = nodes
        .filter(node => node.parent_id)
        .map(node => ({
          source: node.parent_id!,
          target: node.id
        }));

    } catch (err: any) {
      error = err.message;
      console.error('Error loading mindmap:', err);
    }
  }

  async function addNode() {
    if (!newNodeContent.trim()) return;

    try {
      const { data, error: err } = await supabase
        .from('mindmap_nodes')
        .insert([
          {
            mindmap_id: mindmapId,
            parent_id: selectedNodeId,
            content: newNodeContent,
            position_x: Math .random() * 800,
            position_y: Math.random() * 600
          }
        ])
        .select()
        .single();

      if (err) throw err;

      nodes = [...nodes, data];
      if (selectedNodeId) {
        links = [...links, { source: selectedNodeId, target: data.id }];
      }
      newNodeContent = '';
      selectedNodeId = null;
    } catch (err: any) {
      error = err.message;
    }
  }

  async function updateNodePosition(node: Node) {
    try {
      const { error: err } = await supabase
        .from('mindmap_nodes')
        .update({
          position_x: node.position_x,
          position_y: node.position_y
        })
        .eq('id', node.id);

      if (err) throw err;
    } catch (err: any) {
      error = err.message;
      console.error('Error updating node position:', err);
    }
  }

  async function checkOwnership() {
    const { data: mindmap } = await supabase
      .from('mindmaps')
      .select('owner_id')
      .eq('id', mindmapId)
      .single();

    const session = await supabase.auth.getSession();
    isOwner = mindmap?.owner_id === session.data.session?.user.id;
  }

  async function handleDelete() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!isOwner) {
      if (confirm('Are you sure you want to remove yourself from this mindmap?')) {
        try {
          const response = await fetch(`/api/mindmaps/${mindmapId}/collaborators`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session?.user.email })
          });
          
          if (response.ok) {
            goto('/mindmaps');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    } else {
      // For owners, delete the entire mindmap
      if (confirm('Are you sure you want to delete this mindmap?')) {
        try {
          const response = await fetch(`/api/mindmaps/${mindmapId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            goto('/mindmaps');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  }

  // Subscribe to real-time updates
  onMount(() => {
    loadMindmap();
    checkOwnership();

    const nodesSubscription = supabase
      .channel('mindmap-nodes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mindmap_nodes',
          filter: `mindmap_id=eq.${mindmapId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNode = payload.new as Node;
            nodes = [...nodes, newNode];
            if (newNode.parent_id) {
              links = [...links, { source: newNode.parent_id, target: newNode.id }];
            }
          } else if (payload.eventType === 'DELETE') {
            const oldNode = payload.old as Node;
            nodes = nodes.filter(n => n.id !== oldNode.id);
            links = links.filter(l => l.source !== oldNode.id && l.target !== oldNode.id);
          } else if (payload.eventType === 'UPDATE') {
            const updatedNode = payload.new as Node;
            nodes = nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
          }
        }
      )
      .subscribe();

    return () => {
      nodesSubscription.unsubscribe();
    };
  });
</script>

<div class="space-y-6 p-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-semibold text-gray-900">
      {mindmap?.title || 'Loading...'}
    </h1>
  </div>

  {#if error}
    <div class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{error}</p>
    </div>
  {/if}

  <div class="w-full">
    <MindMap 
      {nodes} 
      {links} 
      {mindmapId}
      onNodePositionUpdate={updateNodePosition} 
    />
  </div>

  <button 
    on:click={handleDelete}
    class="text-red-600 hover:text-red-800"
  >
    {isOwner ? 'Delete Mindmap' : 'Remove from Workspace'}
  </button>
</div>
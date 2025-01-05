<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import MindMap from '$lib/components/MindMap.svelte';
  import type { Node, Link, MindMap as MindMapType } from '$lib/types';
  import InviteUsers from '$lib/components/InviteUsers.svelte';

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
      console.log('Loading mindmap:', mindmapId);
      
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
      console.log('Loaded mindmap:', mindmap);

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
      console.log('Loaded nodes:', nodes);

      // Create links from parent-child relationships
      links = nodes
        .filter(node => node.parent_id)
        .map(node => ({
          source: node.parent_id!,
          target: node.id
        }));
      console.log('Created links:', links);

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
  <div class="bg-white shadow sm:rounded-lg p-4">
    <form on:submit|preventDefault={addNode} class="flex gap-4">
      <input
        type="text"
        bind:value={newNodeContent}
        placeholder="Enter node content"
        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
      <select
        bind:value={selectedNodeId}
        class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value={null}>No parent (root node)</option>
        {#each nodes as node}
          <option value={node.id}>{node.content}</option>
        {/each}
      </select>
      <button
        type="submit"
        disabled={!newNodeContent.trim()}
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Add Node
      </button>
    </form>
  </div>


  {#if isOwner}
    <div class="w-full">
      <InviteUsers {mindmapId} />
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

</div>
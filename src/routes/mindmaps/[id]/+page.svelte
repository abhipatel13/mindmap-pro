<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import MindMap from '$lib/components/MindMap.svelte';
  import type { Node, Link, MindMap as MindMapType } from '$lib/types';
  import InviteUsers from '$lib/components/InviteUsers.svelte';
  import { goto } from '$app/navigation';
  import type { RealtimeChannel } from '@supabase/supabase-js';

  const mindmapId = $page.params.id;
  let mindmap: MindMapType | null = null;
  let nodes: Node[] = [];
  let links: Link[] = [];
  let newNodeContent = '';
  let selectedNodeId: string | null = null;
  let error = '';
  let isOwner = false;
  let nodesSubscription: RealtimeChannel;

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
  onMount((() => {
    const loadData = async () => {
        try {
            // Load mindmap details first
            const { data: mindmapData, error: mindmapError } = await supabase
                .from('mindmaps')
                .select('*')
                .eq('id', mindmapId)
                .single();

            if (mindmapError) throw mindmapError;
            mindmap = mindmapData;

            // Fetch existing nodes
            const { data: existingNodes, error: nodesError } = await supabase
                .from('mindmap_nodes')
                .select('*')
                .eq('mindmap_id', mindmapId);

            if (nodesError) throw nodesError;

            // Initialize with sample data if no nodes exist
            if (!existingNodes || existingNodes.length === 0) {
                const sampleNodes = [
                    { 
                        content: 'Root',
                        mindmap_id: mindmapId,
                        parent_id: null,
                        position_x: 400,
                        position_y: 300
                    },
                    {
                        content: 'Child 1',
                        mindmap_id: mindmapId,
                        parent_id: null, // Will update after root is created
                        position_x: 200,
                        position_y: 200
                    },
                    {
                        content: 'Child 2',
                        mindmap_id: mindmapId,
                        parent_id: null, // Will update after root is created
                        position_x: 600,
                        position_y: 400
                    }
                ];

                // Insert root node first
                const { data: rootNode, error: rootError } = await supabase
                    .from('mindmap_nodes')
                    .insert([sampleNodes[0]])
                    .select()
                    .single();

                if (rootError) throw rootError;

                // Update children with root's ID and insert
                sampleNodes[1].parent_id = rootNode.id;
                sampleNodes[2].parent_id = rootNode.id;

                const { data: childNodes, error: childrenError } = await supabase
                    .from('mindmap_nodes')
                    .insert([sampleNodes[1], sampleNodes[2]])
                    .select();

                if (childrenError) throw childrenError;

                nodes = [rootNode, ...childNodes];
                links = childNodes.map(node => ({
                    source: node.parent_id,
                    target: node.id
                }));
            } else {
                nodes = existingNodes;
                links = existingNodes
                    .filter(node => node.parent_id)
                    .map(node => ({
                        source: node.parent_id!,
                        target: node.id
                    }));
            }

            // Setup real-time subscription
            nodesSubscription = supabase
                .channel('mindmap-nodes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'mindmap_nodes', filter: `mindmap_id=eq.${mindmapId}` },
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

        } catch (err) {
            console.error('Error:', err);
            error = 'Failed to load mindmap';
        }
    };
    
    loadData();
    
    return () => {
        if (nodesSubscription) nodesSubscription.unsubscribe();
    };
  }) as () => (() => void));
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

</div>
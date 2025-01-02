<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { Node, Link } from '$lib/types';
  import { supabase } from '../supabase';

  export let nodes: Node[] = [];
  export let links: Link[] = [];
  export let onNodePositionUpdate: ((node: Node) => void) | null = null;
  export let mindmapId: string;

  let svg: SVGElement;
  let width = 1000;
  let height = 800;
  let container: HTMLDivElement;
  
  $: if (container) {
    width = container.clientWidth;
    height = container.clientHeight;
  }

  $: console.log('MindMap props:', { nodes, links });

  $: console.log('MindMap received:', { nodes, links, width, height });

  let simulation: d3.Simulation<Node, undefined>;

  // Watch for changes in nodes and links
  $: if (svg && nodes.length > 0) {
    // Clear previous simulation
    if (simulation) simulation.stop();

    const svgElement = d3.select(svg);
    svgElement.selectAll('*').remove();

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create container for links and nodes
    const g = svgElement.append('g');

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 30)
      .attr('fill', 'white')
      .attr('stroke', '#666')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.content)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em');

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });
  }

  let channel: any;
  let activeUsers: any[] = [];

  function updateVisualization() {
    if (!svg || nodes.length === 0) return;

    const svgElement = d3.select(svg);
    svgElement.selectAll('*').remove();

    simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const g = svgElement.append('g');

    // Draw nodes
    const node = g.selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 30)
      .attr('fill', 'white')
      .attr('stroke', '#666');

    // Add labels
    node.append('text')
      .text(d => d.content)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#333');

    // Update positions on tick
    simulation.on('tick', () => {
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    
    if (onNodePositionUpdate) {
      onNodePositionUpdate({
        ...event.subject,
        position_x: event.x,
        position_y: event.y
      });
    }
  }

  onMount(() => {
    channel = supabase.channel(`mindmap:${mindmapId}`)
      // Track node changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mindmap_nodes',
        filter: `mindmap_id=eq.${mindmapId}`
      }, async (payload) => {
        console.log('Node change detected:', payload);
        switch (payload.eventType) {
          case 'INSERT':
            nodes = [...nodes, payload.new as Node];
            if (payload.new.parent_id) {
              links = [...links, { 
                source: payload.new.parent_id, 
                target: payload.new.id 
              }];
            }
            break;
          case 'UPDATE':
            nodes = nodes.map(node => 
              node.id === payload.new.id ? (payload.new as Node) : node
            );
            break;
          case 'DELETE':
            nodes = nodes.filter(node => node.id !== payload.old.id);
            links = links.filter(l => 
              l.source !== payload.old.id && l.target !== payload.old.id
            );
            break;
        }
        updateVisualization();
      })
      .subscribe();

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      activeUsers = Object.values(state).flat();
      console.log('Active users:', activeUsers);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', leftPresences);
    });

    // Subscribe and track presence
    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser();
        await channel.track({
          user_id: user?.id,
          online_at: new Date().toISOString(),
        });
      }
    });
  });

  onDestroy(() => {
    if (channel) {
      channel.untrack();
      channel.unsubscribe();
    }
    if (simulation) simulation.stop();
  });
</script>

<div 
  bind:this={container} 
  class="w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden relative"
>
  {#if nodes.length === 0}
    <div class="flex items-center justify-center h-full text-gray-500">
      No nodes to display. Add your first node above.
    </div>
  {:else}
    <svg
      bind:this={svg}
      {width}
      {height}
      class="w-full h-full border border-gray-300"
      viewBox="0 0 {width} {height}"
    />
  {/if}

  <!-- Show active users -->
  {#if activeUsers.length > 0}
    <div class="absolute top-2 right-2 flex gap-2">
      {#each activeUsers as user}
        <div class="px-2 py-1 bg-blue-100 rounded text-sm">
          User {user.user_id.slice(0, 6)}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  div {
    overflow: hidden;
  }
  svg {
    cursor: grab;
  }
  svg:active {
    cursor: grabbing;
  }
</style>
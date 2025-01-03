<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { Node, Link } from '$lib/types';
  import { createMindmapWebSocket, sendWebSocketMessage } from '../stores/mindmapWebSocket';
  import { supabase } from '../supabase';

  export let nodes: Node[] = [];
  export let links: Link[] = [];
  export let mindmapId: string;

  let svg: SVGElement;
  let width = 800;
  let height = 600;
  let simulation: any;
  let channel: any;
  let userId: string;
  let cursors: Map<string, { x: number; y: number }> = new Map();

  function updateVisualization() {
    if (!svg || nodes.length === 0) return;

    const svgElement = d3.select(svg);
    svgElement.selectAll('*').remove();

    const g = svgElement.append('g');

    // Process links
    const processedLinks = links.map(link => ({
      source: nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id)),
      target: nodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id))
    })).filter(link => link.source && link.target);

    // Draw links
    const linkElements = g.append('g')
      .selectAll('line')
      .data(processedLinks)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Draw nodes
    const nodeElements = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragended));

    nodeElements.append('circle')
      .attr('r', 30)
      .attr('fill', 'white')
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    nodeElements.append('text')
      .text(d => d.content)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#333');

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(processedLinks).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .on('tick', () => {
        nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
        
        linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
      });
  }

  function dragStarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
  }

  function dragged(event: any) {
    event.subject.x = event.x;
    event.subject.y = event.y;
    
    sendWebSocketMessage(channel, 'node_move', {
      id: event.subject.id,
      x: event.x,
      y: event.y
    }, userId, mindmapId);
  }

  async function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);

    try {
      await supabase
        .from('mindmap_nodes')
        .update({
          position_x: event.subject.x,
          position_y: event.subject.y
        })
        .eq('id', event.subject.id)
        .eq('mindmap_id', mindmapId);

      sendWebSocketMessage(channel, 'node_update', {
        id: event.subject.id,
        x: event.subject.x,
        y: event.subject.y
      }, userId, mindmapId);
    } catch (err) {
      console.error('Error updating node position:', err);
    }
  }

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || 'anonymous';

    channel = await createMindmapWebSocket(mindmapId, {
      onNodeMove: (payload) => {
        const nodeIndex = nodes.findIndex(n => n.id === payload.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex].x = payload.x;
          nodes[nodeIndex].y = payload.y;
          nodes = [...nodes];
          updateVisualization();
        }
      },
      onNodeUpdate: (payload) => {
        const nodeIndex = nodes.findIndex(n => n.id === payload.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex].x = payload.x;
          nodes[nodeIndex].y = payload.y;
          nodes = [...nodes];
          updateVisualization();
        }
      },
      onNodeAdd: (newNode) => {
        if (!nodes.some(n => n.id === newNode.id)) {
          nodes = [...nodes, newNode];
          if (newNode.parent_id) {
            links = [...links, { source: newNode.parent_id, target: newNode.id }];
          }
          updateVisualization();
        }
      },
      onNodeDelete: (nodeId) => {
        nodes = nodes.filter(n => n.id !== nodeId);
        links = links.filter(l => l.source !== nodeId && l.target !== nodeId);
        updateVisualization();
      }
    });

    updateVisualization();
  });

  onDestroy(() => {
    if (simulation) simulation.stop();
    if (channel) channel.unsubscribe();
  });

  $: {
    if (svg && nodes.length > 0) {
      updateVisualization();
    }
  }
</script>

<div class="w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
  <svg
    bind:this={svg}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="w-full h-full"
  />
</div>

<style>
  svg {
    cursor: grab;
  }
  svg:active {
    cursor: grabbing;
  }
</style>
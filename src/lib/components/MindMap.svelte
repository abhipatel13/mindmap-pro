<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { Node, Link } from '$lib/types';
  import { createMindmapWebSocket, sendWebSocketMessage } from '../stores/mindmapWebSocket';
  import { supabase } from '../supabase';

  export let nodes: Node[];
  export let links: Link[];
  export let mindmapId: string;
  export let onNodePositionUpdate: (node: Node) => Promise<void>;

  let svg: SVGElement;
  let g: any;
  let root: any;
  let width = window.innerWidth;
  let height = window.innerHeight * 0.9;
  let simulation: any;
  let channel: any;
  let userId: string;
  let cursors: Map<string, { x: number; y: number }> = new Map();
  let zoomBehavior: any;
  let currentLevel = 2;
  let inviteEmail: string;
  let inviteRole: string;
  let currentZoom = 1;

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

    // Add hover menu
    const hoverGroup = nodeElements.append('g')
      .attr('class', 'hover-icons')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    hoverGroup.selectAll('text')
      .data(d => [{
        text: '+',
        x: 15,
        action: () => addChild(d)
      }, {
        text: '✖',
        x: 35,
        action: () => deleteNode(d)
      }, {
        text: '✎',
        x: 55,
        action: () => editNode(d)
      }])
      .join('text')
      .attr('x', d => d.x)
      .attr('dy', 30)
      .text(d => d.text)
      .on('click', (event, d) => {
        event.stopPropagation();
        d.action();
      });

    // Add hover effects
    nodeElements.on('mouseover', function() {
      d3.select(this)
        .select('.hover-icons')
        .style('pointer-events', 'all')
        .transition()
        .duration(300)
        .style('opacity', 1);
    })
    .on('mouseout', function(event) {
      const hoverGroup = d3.select(this).select('.hover-icons');
      const bbox = (hoverGroup.node() as HTMLElement).getBoundingClientRect();

      if (event.relatedTarget && !(hoverGroup.node() as HTMLElement).contains(event.relatedTarget as globalThis.Node)) {
        if (event.pageX < bbox.left || event.pageX > bbox.right ||
            event.pageY < bbox.top || event.pageY > bbox.bottom) {
          hoverGroup
            .transition()
            .duration(300)
            .style('opacity', 0)
            .on('end', () => hoverGroup.style('pointer-events', 'none'));
        }
      }
    });

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

    // Set up zoom behavior
    zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', handleZoom);

    svgElement.call(zoomBehavior);
  }

  function handleZoom(event: any) {
    const transform = event.transform;
    d3.select(svg).select('g').attr("transform", transform);
    currentZoom = transform.k;
  }

  function updateZoomLevel(k) {
    // Update zoom level display (you can add this to your UI)
    console.log(`Zoom: ${(k * 100).toFixed(0)}%`);
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

  async function addChild(parent: Node) {
    const newNodeContent = prompt('Enter the content for the new node:');
    if (newNodeContent) {
      try {
        const { data: newNode, error } = await supabase
          .from('mindmap_nodes')
          .insert({
            content: newNodeContent,
            mindmap_id: mindmapId,
            parent_id: parent.id
          })
          .select()
          .single();

        if (error) throw error;

        nodes = [...nodes, newNode];
        links = [...links, { source: parent.id, target: newNode.id }];

        sendWebSocketMessage(channel, 'node_add', newNode, userId, mindmapId);
        updateVisualization();
      } catch (err) {
        console.error('Error adding new node:', err);
      }
    }
  }

  async function deleteNode(node: Node) {
    if (confirm('Are you sure you want to delete this node?')) {
      try {
        const { error } = await supabase
          .from('mindmap_nodes')
          .delete()
          .eq('id', node.id)
          .eq('mindmap_id', mindmapId);

        if (error) throw error;

        nodes = nodes.filter(n => n.id !== node.id);
        links = links.filter(l => l.source !== node.id && l.target !== node.id);

        sendWebSocketMessage(channel, 'node_delete', { id: node.id }, userId, mindmapId);
        updateVisualization();
      } catch (err) {
        console.error('Error deleting node:', err);
      }
    }
  }

  async function editNode(node: Node) {
    const newContent = prompt('Edit node content:', node.content);
    if (newContent !== null && newContent !== node.content) {
      try {
        const { error } = await supabase
          .from('mindmap_nodes')
          .update({ content: newContent })
          .eq('id', node.id)
          .eq('mindmap_id', mindmapId);

        if (error) throw error;

        node.content = newContent;
        nodes = [...nodes];

        sendWebSocketMessage(channel, 'node_update', { id: node.id, content: newContent }, userId, mindmapId);
        updateVisualization();
      } catch (err) {
        console.error('Error updating node content:', err);
      }
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
          nodes[nodeIndex].content = payload.content;
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

  function update() {
    if (!svg || !root) return;

    const tree = d3.tree()
      .nodeSize([60, 140])  // Fixed spacing between nodes
      .separation(() => 1);  // Fixed separation

    tree(root);

    g.selectAll(".node").remove();
    g.selectAll(".link").remove();

    // Update links with straight lines
    const links = g.selectAll(".link")
      .data(root.links().filter(d => d.target.depth < currentLevel))
      .join("line")
      .attr("class", "link")
      .attr("x1", d => d.source.y)
      .attr("y1", d => d.source.x)
      .attr("x2", d => d.target.y)
      .attr("y2", d => d.target.x);

    // Update nodes with rectangles
    const nodes = g.selectAll(".node")
      .data(root.descendants().filter(d => d.depth < currentLevel))
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Add rectangles for nodes
    nodes.append("rect")
      .attr("x", -50)
      .attr("y", -15)
      .attr("width", 100)
      .attr("height", 30)
      .attr("rx", 2)
      .attr("ry", 2);

    // Add text
    nodes.append("text")
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .attr("class", "node-text");
  }

  // Update level change handler
  function handleLevelChange() {
    update();  // Call update directly when level changes
  }

  function handleInvite() {
    // Handle invite functionality
  }

  onMount(() => {
    zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", handleZoom);

    d3.select(svg).call(zoomBehavior);
  });

  function handleZoomIn() {
    if (!svg || !zoomBehavior) return;
    d3.select(svg)
      .transition()
      .duration(300)
      .call(zoomBehavior.scaleBy, 1.2);
  }

  function handleZoomOut() {
    if (!svg || !zoomBehavior) return;
    d3.select(svg)
      .transition()
      .duration(300)
      .call(zoomBehavior.scaleBy, 0.8);
  }

  function resetZoom() {
    if (!svg || !zoomBehavior) return;
    d3.select(svg)
      .transition()
      .duration(300)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 4, height / 4).scale(1)
      );
  }
</script>

<div class="container">
  <div class="zoom-controls">
    <button class="zoom-btn" on:click={handleZoomIn}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-width="2" d="M12 6v12M6 12h12"/>
      </svg>
    </button>
    <span class="zoom-level">{(currentZoom * 100).toFixed(0)}%</span>
    <button class="zoom-btn" on:click={handleZoomOut}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-width="2" d="M6 12h12"/>
      </svg>
    </button>
    <button class="zoom-btn" on:click={resetZoom}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-width="2" d="M15 15l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2"/>
      </svg>
    </button>
  </div>
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
  .hover-icons {
    pointer-events: all;
    transition: opacity 0.4s;
    padding: 10px;
  }
  .hover-icons text {
    cursor: pointer;
    font-size: 16px;
    pointer-events: all;
    fill: #666;
  }
  .hover-icons text:hover {
    fill: #3182bd;
  }
  .node rect {
    fill: white;
    stroke: #3182bd;
    stroke-width: 1.5px;
  }

  .node-text {
    font: 12px sans-serif;
    pointer-events: none;
  }

  .link {
    stroke: #ccc;
    stroke-width: 1.5px;
  }

  .invitation-bar {
    width: 100%;
    padding: 12px 20px;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
  }

  .invite-form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .invite-input {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .role-select {
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .invite-button {
    padding: 6px 16px;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .invite-button:hover {
    background-color: #2c5282;
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .zoom-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: white;
    padding: 8px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .zoom-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background-color: white;
    color: var(--theme-color);
    cursor: pointer;
    transition: all 0.2s;
  }

  .zoom-btn:hover {
    background-color: var(--theme-color);
    color: white;
  }

  .zoom-level {
    min-width: 60px;
    text-align: center;
    font-size: 14px;
    color: #374151;
    font-weight: 500;
  }
</style>

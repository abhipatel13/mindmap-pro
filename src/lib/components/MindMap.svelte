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
  let status: number = 0;
  let previousScale = 1;
  console.log('MindMap.svelte');

  function updateVisualization() {
    if (!svg || nodes.length === 0) return;

    const visibleNodes = nodes.filter(node => {
      const depth = getNodeDepth(node);
      return depth < currentLevel;
    });

    const visibleLinks = links.filter(link => {
      const sourceDepth = getNodeDepth(nodes.find(n => n.id === link.source));
      const targetDepth = getNodeDepth(nodes.find(n => n.id === link.target));
      return sourceDepth < currentLevel - 1 && targetDepth < currentLevel;
    });

    const svgElement = d3.select(svg);
    svgElement.selectAll('*').remove();

    const g = svgElement.append('g');

    const processedLinks = visibleLinks.map(link => ({
      source: nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id)),
      target: nodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id))
    })).filter(link => link.source && link.target);

    const linkElements = g.append('g')
      .selectAll('line')
      .data(processedLinks)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Draw nodes
    const nodeElements = g.append('g')
      .selectAll('g')
      .data(visibleNodes)
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

    simulation = d3.forceSimulation(visibleNodes)
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

    zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', handleZoom);

    svgElement.call(zoomBehavior);
  }

  function handleZoom(event: any) {
    const transform = event.transform;
    d3.select(svg).select('g').attr("transform", transform);
    currentZoom = transform.k;
    
    // Update level based on zoom scale
    if (transform.k <= 0.5) {
        currentLevel = 1;
    } else if (transform.k <= 0.75) {
        currentLevel = 2;
    } else if (transform.k <= 1.0) {
        currentLevel = 3;
    } else if (transform.k <= 1.25) {
        currentLevel = 4;
    } else {
        currentLevel = 5;
    }
    
    console.log('Zoom scale:', transform.k.toFixed(2), 'Level:', currentLevel);
    // updateVisualization();
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
  function handleLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    currentLevel = parseInt(select.value);
    updateVisualization();
  }

  onMount(() => {
    const svgElement = d3.select(svg)
        .attr("viewBox", [0, 0, width, height])
        .attr("preserveAspectRatio", "xMidYMid meet");

    g = svgElement.append("g")
        .attr("transform", `translate(0,${height / 2})`);

        svgElement.call(zoom);
  });

  function handleZoomIn() {
    if (!svg || !zoomBehavior) return;
    
    // Increase level (max 5)
    currentLevel = Math.min(currentLevel + 1, 5);
    console.log('Zoom In - New Level:', currentLevel);
    
    d3.select(svg)
        .transition()
        .duration(300)
        .call(zoomBehavior.scaleBy, 1.2);
    
    updateVisualization();
  }

  function handleZoomOut() {
    if (!svg || !zoomBehavior) return;
    
    // Decrease level (min 1)
    currentLevel = Math.max(currentLevel - 1, 1);
    console.log('Zoom Out - New Level:', currentLevel);
    
    d3.select(svg)
        .transition()
        .duration(300)
        .call(zoomBehavior.scaleBy, 0.8);
    
    updateVisualization();
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

  function getNodeDepth(node: Node): number {
    let depth = 0;
    let current = node;
    
    while (current.parent_id) {
      depth++;
      current = nodes.find(n => n.id === current.parent_id) || current;
      if (!current) break;
    }
    
    return depth;
  }

  const zoomLevels = {
    0.5: 1,    // Level 1 only
    0.75: 2,   // Level 1-2
    1.0: 3,    // Level 1-3
    1.25: 4,   // Level 1-4
    1.5: 5     // Level 1-5
  };

  function updateNodesForZoom(scale: number) {
    console.log('updateNodesForZoom');
    if (!root) return;
    status = 1;

    // Log zoom information
    console.log('Current zoom scale:', scale.toFixed(2));
    console.log('Previous scale:', previousScale.toFixed(2));

    // Get target depth and update level
    const targetDepth = getTargetDepth(scale);
    console.log('Target depth:', targetDepth);
    currentLevel = targetDepth;
    
    if (scale < previousScale) {
        console.log('Zooming OUT - Collapsing to level:', targetDepth);
        collapseToLevel(root, 0, targetDepth);
    } else {
        console.log('Zooming IN - Expanding to level:', targetDepth);
        expandToLevel(root, 0, targetDepth);
    }
    
    previousScale = scale;
    updateVisualization();
  }

  function getTargetDepth(scale: number): number {
    let depth;
    if (scale <= 0.5) depth = 1;
    else if (scale <= 0.75) depth = 2;
    else if (scale <= 1.0) depth = 3;
    else if (scale <= 1.25) depth = 4;
    else depth = 5;
    
    console.log('Scale:', scale.toFixed(2), '-> Depth:', depth);
    return depth;
  }

  const zoom = d3.zoom()
    .scaleExtent([0.5, 1.5])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
        updateNodesForZoom(event.transform.k);
    });

  function collapseToLevel(node: any, depth: number, maxDepth: number) {
    if (!node) return;
    if (depth >= maxDepth && node.children) {
        node._children = node.children;
        node.children = null;
    }
    if (node.children) {
        node.children.forEach((child: any) => collapseToLevel(child, depth + 1, maxDepth));
    }
  }

  function expandToLevel(node: any, depth: number, maxDepth: number) {
    if (!node) return;
    if (depth < maxDepth && node._children) {
        node.children = node._children;
        node._children = null;
    }
    if (node.children) {
        node.children.forEach((child: any) => expandToLevel(child, depth + 1, maxDepth));
    }
  }
</script>

<div class="container">
  <div class="controls">
    <div class="control-group">
      <div class="zoom-controls">
        <button class="control-btn" on:click={handleZoomIn}>+</button>
        <span class="zoom-level">{(currentZoom * 100).toFixed(0)}%</span>
        <button class="control-btn" on:click={handleZoomOut}>-</button>
        <button class="control-btn" on:click={resetZoom}>Reset</button>
      </div>
      <div class="level-controls">
        <label for="level-select">Level:</label>
        <select 
          id="level-select" 
          bind:value={currentLevel}
          on:change={handleLevelChange}
          class="level-select"
        >
          {#each Array(5) as _, i}
            <option value={i + 1}>{i + 1}</option>
          {/each}
        </select>
      </div>
    </div>
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

  .controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: white;
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .zoom-controls, .level-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-btn {
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

  .level-select {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background-color: white;
    color: #374151;
  }
</style>

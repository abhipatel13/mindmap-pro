<script context="module" lang="ts">
  declare global {
    interface Window {
      d3: any;
      jQuery: any;
    }
  }
</script>

<svelte:head>
  <script src="https://d3js.org/d3.v3.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">
  <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"></script>
</svelte:head>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';

  // Get mindmap ID from URL
  $: mindmapId = $page.params.id;

  let width = 1000;
  let height = 800;
  let selectedNode: any = null;
  let currentLayout = 'horizontal';
  let svg: any;
  let force: any;
  let isLoaded = false;
  let subscription: any;
  let zoomLevel = 100;
  let currentLevel = 1;
  let zoomBehavior: any;

  let root = {
    content: "Root",
    children: [],
    id: 0
  };

  async function loadNodes() {
    const { data, error } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .order('created_at');

    if (error) {
      console.error('Error loading nodes:', error);
      return;
    }

    // Convert flat data to tree structure
    const nodeMap = new Map();
    data.forEach((node: any) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Reset root
    root = {
      content: "Root",
      children: [],
      id: 0
    };

    data.forEach((node: any) => {
      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id);
        if (parent) {
          parent.children.push(nodeMap.get(node.id));
        }
      } else {
        // This is the root node for this mindmap
        Object.assign(root, nodeMap.get(node.id));
      }
    });

    update();
  }

  async function setupRealtimeSubscription() {
    subscription = supabase
      .channel('mindmap_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mindmap_nodes',
          filter: `mindmap_id=eq.${mindmapId}`
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  function handleRealtimeUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log('Realtime update:', eventType, payload);

    switch (eventType) {
      case 'INSERT':
        // Only add if not already in tree
        if (!findNodeById(root, newRecord.id)) {
          addNodeToTree(newRecord);
        }
        break;
      case 'UPDATE':
        updateNodeInTree(newRecord);
        break;
      case 'DELETE':
        loadNodes();
        break;
    }
  }

  function addNodeToTree(node: any) {
    const newNode = { ...node, children: [] };
    if (node.parent_id) {
      const parent = findNodeById(root, node.parent_id);
      if (parent) {
        parent.children.push(newNode);
      }
    } else {
      root.children.push(newNode);
    }
    update();
  }

  function updateNodeInTree(node: any) {
    const existingNode = findNodeById(root, node.id);
    if (existingNode) {
      existingNode.content = node.content;
      existingNode.rich_content = node.rich_content;
      update();
    }
  }

  function removeNodeFromTree(nodeId: number) {
    console.log('Removing node:', nodeId);
    
    function removeRecursive(parent: any): boolean {
      if (!parent.children) return false;
      
      const initialLength = parent.children.length;
      parent.children = parent.children.filter(child => {
        if (child.id === nodeId) return false;
        removeRecursive(child);
        return true;
      });
      
      return initialLength !== parent.children.length;
    }
    
    removeRecursive(root);
  }

  function findNodeById(node: any, id: number): any {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  async function addChild() {
    if (selectedNode) {
      const newNodeId = Date.now(); // Generate unique ID
      const newNode = {
        id: newNodeId,
        content: "New Node",
        parent_id: selectedNode.id,
        mindmap_id: mindmapId,
        rich_content: null
      };

      const { error } = await supabase
        .from('mindmap_nodes')
        .insert(newNode);

      if (error) {
        console.error('Error adding node:', error);
        return;
      }

      // Immediately add node to local tree
      addNodeToTree(newNode);
      
      // Force update visualization
      update();
      hideMenu();
    }
  }

  async function deleteNode() {
    if (selectedNode && selectedNode.id !== 0) {
      // Get all descendant nodes first
      const nodesToDelete = [];
      
      function collectNodes(node: any) {
        nodesToDelete.push(node.id);
        if (node.children) {
          node.children.forEach((child: any) => collectNodes(child));
        }
      }
      
      collectNodes(selectedNode);

      // Delete all nodes in a single operation
      const { error } = await supabase
        .from('mindmap_nodes')
        .delete()
        .in('id', nodesToDelete)
        .eq('mindmap_id', mindmapId);

      if (error) {
        console.error('Error deleting nodes:', error);
        return;
      }

      // Immediately update local tree
      nodesToDelete.forEach(id => removeNodeFromTree(id));
      
      // Force update
      update();
      hideMenu();
    }
  }

  async function saveEdit() {
    if (selectedNode && selectedNode.id !== 0) {
      const content = window.jQuery('#summernote').summernote('code');
      const plainText = window.jQuery('<div>').html(content).text();
      
      const { error } = await supabase
        .from('mindmap_nodes')
        .update({
          content: plainText || "Empty Node",
          rich_content: content
        })
        .eq('id', selectedNode.id)
        .eq('mindmap_id', mindmapId);

      if (error) {
        console.error('Error updating node:', error);
        return;
      }

      closeEdit();
    }
  }

  async function initializeMindmap() {
    // Check if root node exists for this mindmap
    const { data: existingNodes } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', mindmapId);

    if (!existingNodes || existingNodes.length === 0) {
      // Create root node
      const { data: rootNode, error: rootError } = await supabase
        .from('mindmap_nodes')
        .insert({
          id: Date.now(),
          content: 'Root',
          parent_id: null,
          mindmap_id: mindmapId,
          rich_content: null
        })
        .select()
        .single();

      if (rootError) {
        console.error('Error creating root node:', rootError);
        return;
      }

      // Create two child nodes
      const childNodes = [
        {
          content: 'Child 1',
          parent_id: rootNode.id,
          mindmap_id: mindmapId,
          rich_content: null
        },
        {
          content: 'Child 2',
          parent_id: rootNode.id,
          mindmap_id: mindmapId,
          rich_content: null
        }
      ];

      const { error: childError } = await supabase
        .from('mindmap_nodes')
        .insert(childNodes);

      if (childError) {
        console.error('Error creating child nodes:', childError);
        return;
      }
    }

    await loadNodes();
  }

  function initializeZoom() {
    zoomBehavior = window.d3.zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", handleZoom);

    svg.call(zoomBehavior);
  }

  function handleZoom(event: any) {
    const transform = event.transform;
    svg.select("g").attr("transform", transform);
    zoomLevel = Math.round(transform.k * 100);
  }

  function zoomIn() {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.2);
  }

  function zoomOut() {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.8);
  }

  function resetZoom() {
    svg.transition().duration(300).call(zoomBehavior.transform, window.d3.zoomIdentity);
    zoomLevel = 100;
  }

  function setLevel(level: number) {
    currentLevel = level;
    const nodes = flatten(root);
    const visibleNodes = nodes.filter(n => n.depth < level);
    const visibleLinks = window.d3.layout.tree()
      .links(nodes)
      .filter(l => l.source.depth < level - 1);

    force.nodes(visibleNodes)
      .links(visibleLinks)
      .start();
    
    update();
  }

  onMount(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (browser && window.d3) {
      width = window.innerWidth;
      height = window.innerHeight;

      force = window.d3.layout.force()
        .size([width, height])
        .charge(-1000)
        .linkDistance(100)
        .gravity(0.1)
        .on("tick", tick);

      svg = window.d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(40,0)");

      isLoaded = true;
      
      await initializeMindmap();
      await setupRealtimeSubscription();
      initializeZoom();
    }
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  function update() {
    if (!svg) return;
    const nodes = flatten(root);
    const visibleNodes = nodes.filter(n => n.depth < currentLevel);
    const visibleLinks = window.d3.layout.tree()
      .links(nodes)
      .filter(l => l.source.depth < currentLevel - 1);

    force.nodes(visibleNodes)
      .links(visibleLinks)
      .start();

    const link = svg.selectAll(".link")
      .data(visibleLinks, (d: any) => d.target.id);

    link.enter().insert("path", ".node")
      .attr("class", "link");
    link.exit().remove();

    const node = svg.selectAll(".node")
      .data(visibleNodes, (d: any) => d.id);

    const nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    nodeEnter.append("circle")
      .attr("r", 10);

    nodeEnter.append("foreignObject")
      .attr("width", 200)
      .attr("height", 100)
      .attr("x", 12)
      .attr("y", -25)
      .append("xhtml:div")
      .style("font", "14px sans-serif")
      .html((d: any) => {
        console.log('Node data:', d); // Debug log
        return d.rich_content || d.content || d.name || "Unnamed Node";
      });

    addNodeControls(nodeEnter);

    // Update existing node content
    node.select("foreignObject div")
      .html((d: any) => d.rich_content || d.content || d.name || "Unnamed Node");

    node.exit().remove();
  }

  function tick() {
    if (currentLayout === 'horizontal') {
      svg.selectAll(".node").each((d: any) => {
        d.y = Math.max(50, Math.min(height - 50, d.y));
        d.x = d.depth * 180 + 60;
      });
    } else {
      svg.selectAll(".node").each((d: any) => {
        d.x = Math.max(50, Math.min(width - 50, d.x));
        d.y = d.depth * 180 + 60;
      });
    }

    svg.selectAll(".link").attr("d", (d: any) =>
      `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
    );

    svg.selectAll(".node").attr("transform", (d: any) =>
      `translate(${d.x},${d.y})`
    );
  }

  function flatten(root: any) {
    const nodes: any[] = [];
    
    function recurse(node: any, depth: number, parent: any) {
      node.depth = depth;
      node.parent = parent;
      nodes.push(node);
      if (node.children) {
        node.children.forEach((child: any) => {
          recurse(child, depth + 1, node);
        });
      }
    }
    
    recurse(root, 0, null);
    return nodes;
  }

  function showMenu(event: MouseEvent, d: any) {
    selectedNode = d;
    const menu = window.d3.select("#menu");
    menu.style("display", "block")
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
  }

  function hideMenu() {
    window.d3.select("#menu").style("display", "none");
  }

  function updateForceStrength(value: string) {
    force.linkDistance(Number(value))
      .start();
  }

  function editNode() {
    if (selectedNode) {
      const content = selectedNode.rich_content || selectedNode.content;
      window.d3.select("#editDialog").style("display", "block");
      
      window.jQuery('#summernote').summernote({
        height: 200,
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['fontsize','strikethrough', 'superscript', 'subscript']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']],
          ['insert', ['link', 'picture', 'video']],
          ['misc', ['codeview']]
        ]
      });
      
      window.jQuery('#summernote').summernote('code', content);
    }
  }

  function closeEdit() {
    window.jQuery('#summernote').summernote('destroy');
    window.d3.select("#editDialog").style("display", "none");
  }

  function setLayout(type: string) {
    currentLayout = type;
    force.stop();

    if (type === 'horizontal') {
      force
        .gravity(0.1)
        .charge(-1000)
        .linkDistance(100)
        .size([width, height]);

      const nodes = flatten(root);
      nodes.forEach((d: any, i: number) => {
        d.x = d.depth * 180;
        d.y = (height/2) + (i - nodes.length/2) * 50;
      });
    } else {
      force
        .gravity(0.3)
        .charge(-800)
        .linkDistance(80)
        .size([width, height]);

      const nodes = flatten(root);
      nodes.forEach((d: any, i: number) => {
        d.y = d.depth * 180;
        d.x = (width/2) + (i - nodes.length/2) * 50;
      });
    }

    update();
    force.start();
  }

  function highlightParentLinks(d: any) {
    svg.selectAll(".link")
      .classed("highlighted", (l: any) => {
        let current = d;
        while (current.parent) {
          if (l.source === current.parent && l.target === current) {
            return true;
          }
          current = current.parent;
        }
        return false;
      });
  }

  function resetHighlight() {
    svg.selectAll(".link")
      .classed("highlighted", false);
  }

  function addNodeControls(nodeEnter: any) {
    const controls = nodeEnter.append("g")
      .attr("class", "node-controls");

    nodeEnter
      .on("mouseover", highlightParentLinks)
      .on("mouseout", resetHighlight)
      .on("click", (d: any) => showMenu(window.d3.event, d));

    const controlData = [
      { angle: 20, icon: "+", action: addChild, class: "add" },
      { angle: 260, icon: "✎", action: editNode, class: "edit" },
      { angle: 140, icon: "\uf2ed", action: deleteNode, class: "delete" }
    ];

    controlData.forEach((ctrl) => {
      const x = Math.cos(ctrl.angle * Math.PI / 180) * 25;
      const y = Math.sin(ctrl.angle * Math.PI / 180) * 25;

      controls.append("circle")
        .attr("class", `control-button ${ctrl.class}`)
        .attr("r", 12)
        .attr("cx", x)
        .attr("cy", y)
        .on("click", (d: any) => {
          window.d3.event.stopPropagation();
          selectedNode = d;
          ctrl.action();
        });

      controls.append("text")
        .attr("class", `control-icon ${ctrl.class}`)
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text(ctrl.icon);
    });
  }
</script>

<div id="chart" style="width: 100%; height: calc(100vh - 64px);">
  {#if isLoaded}
    <div class="menu-container">
        <div id="layoutMenu" style="margin-top: 100px;">
          <div class="controls-row">
            <button class:active={currentLayout === 'horizontal'} on:click={() => setLayout('horizontal')}>
              Horizontal
            </button>
            <button class:active={currentLayout === 'vertical'} on:click={() => setLayout('vertical')}>
              Vertical
            </button>

            <div class="separator">|</div>

            <div class="force-control">
              <label>Force Strength:</label>
              <input 
                type="range" 
                min="10" 
                max="300" 
                value="100" 
                on:input={(e) => updateForceStrength(e.currentTarget.value)}
              >
            </div>

            <div class="separator">|</div>

            <div class="zoom-controls">
              <button on:click={() => svg.transition().call(window.d3.zoom().scaleBy, 1.2)}>+</button>
              <button on:click={() => svg.transition().call(window.d3.zoom().scaleBy, 0.8)}>-</button>
              <button on:click={() => {
                svg.transition().call(window.d3.zoom().transform, window.d3.zoomIdentity);
                zoomLevel = 100;
              }}>Reset</button>
              <span class="zoom-level">Zoom: {zoomLevel}%</span>
            </div>

            <div class="separator">|</div>

            <div class="level-control">
              <label for="level-select">Level:</label>
              <select 
                id="level-select" 
                bind:value={currentLevel} 
                on:change={() => update()}
              >
                <option value={1}>Level 1 (Root only)</option>
                <option value={2}>Level 2 (Root + Children)</option>
                <option value={3}>Level 3 (Root + Children + Grandchildren)</option>
                <option value={4}>Level 4</option>
                <option value={5}>Level 5 (All)</option>
              </select>
            </div>
        </div>
      </div>
    </div>
  {/if}

<div id="editDialog" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
  <div id="summernote"></div>
  <button on:click={saveEdit}>Save</button>
    <button on:click={closeEdit}>Cancel</button>
  </div>
</div>

<style>
  :global(.link) {
    fill: none;
    stroke: #9ecae1;
    stroke-width: 1.5px;
  }

  :global(.node circle) {
    cursor: pointer;
    fill: white;
    stroke: #3182bd;
    stroke-width: 1.5px;
  }

  :global(.node text) {
    font: 12px sans-serif;
    pointer-events: none;
  }

  :global(.node-controls) {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  :global(.node:hover .node-controls) {
    opacity: 1;
  }

  :global(.control-button) {
    cursor: pointer;
    fill: white;
    stroke: #3182bd;
    stroke-width: 1.5px;
  }

  :global(.control-button:hover) {
    fill: #3182bd;
  }

  :global(.control-icon) {
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    font-size: 12px;
    fill: #3182bd;
  }

  :global(.control-button:hover + .control-icon) {
    fill: white;
  }

  :global(.control-button.add) { stroke: #28a745; }
  :global(.control-button.edit) { stroke: #3182bd; }
  :global(.control-button.delete) { stroke: #dc3545; }
  
  :global(.control-button.add:hover) { fill: #28a745; }
  :global(.control-button.edit:hover) { fill: #3182bd; }
  :global(.control-button.delete:hover) { fill: #dc3545; }
  
  :global(.control-icon.add) { fill: #28a745; }
  :global(.control-icon.edit) { fill: #3182bd; }
  :global(.control-icon.delete) { fill: #dc3545; }

  :global(.link.highlighted) {
    stroke: purple;
    stroke-width: 2.5px
  }

  #menu {
    position: absolute;
    display: none;
    background-color: white;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
  }

  #menu button {
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 5px;
    cursor: pointer;
  }

  #layoutMenu {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  #layoutMenu button {
    margin: 5px;
    padding: 5px 10px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  #chart {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .menu-container {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 999;
    background-color: white;
    border-bottom: 1px solid #ccc;
  }

  #layoutMenu {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 100px !important;
    padding: 0 20px;
  }

  .top-bar {
    padding: 10px 20px;
    min-height: 50px;
  }

  .controls-row {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .separator {
    color: #ccc;
    font-size: 18px;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .zoom-controls button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    height: 32px;
  }

  .zoom-level {
    min-width: 80px;
  }

  .level-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .level-control select {
    padding: 5px;
    height: 32px;
    min-width: 200px;
  }

  .force-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .force-control input {
    width: 120px;
  }

  button.active {
    background: #3182bd;
    color: white;
  }
</style>
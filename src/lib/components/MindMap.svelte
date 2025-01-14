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
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let width = 1000;
  let height = 800;
  let selectedNode: any = null;
  let currentLayout = 'horizontal';
  let svg: any;
  let force: any;
  let isLoaded = false;

  let root = {
    "name": "Root",
    "children": [
      { "name": "Child 1", "children": [], "id": 1 },
      { "name": "Child 2", "children": [], "id": 2 }
    ],
    "id": 0
  };

  onMount(async () => {
    // Wait for D3 and other dependencies to load
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
      update();
    }
  });

  function update() {
    if (!svg) return;
    const nodes = flatten(root);
    const links = window.d3.layout.tree().links(nodes);

    force.nodes(nodes)
      .links(links)
      .start();

    const link = svg.selectAll(".link")
      .data(links, (d: any) => d.target.id);

    link.enter().insert("path", ".node")
      .attr("class", "link");
    link.exit().remove();

    const node = svg.selectAll(".node")
      .data(nodes, (d: any) => d.id);

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
      .html((d: any) => d.richContent || d.name);

    addNodeControls(nodeEnter);

    node.select("foreignObject div")
      .html((d: any) => d.richContent || d.name);

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

  function addChild() {
    if (selectedNode) {
      if (!selectedNode.children) {
        selectedNode.children = [];
      }
      const newNode = {
        "name": "New Node",
        "children": [],
        "id": Date.now()
      };
      selectedNode.children.push(newNode);
      update();
      hideMenu();
    }
  }

  function deleteNode() {
    if (selectedNode && selectedNode.parent) {
      const parent = selectedNode.parent;
      parent.children = parent.children.filter((child: any) => child !== selectedNode);
      update();
      hideMenu();
    }
  }

  function editNode() {
    if (selectedNode) {
      const content = selectedNode.richContent || selectedNode.name;
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

  function saveEdit() {
    if (selectedNode) {
      const content = window.jQuery('#summernote').summernote('code');
      selectedNode.richContent = content;
      selectedNode.name = window.jQuery(content).text() || "Empty Node";
      update();
      closeEdit();
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

<div id="chart" style="width: 100%; height: 100vh;"></div>
{#if isLoaded}
  <div id="menu">
    <button on:click={addChild}>Add Child</button>
    <button on:click={deleteNode}>Delete Node</button>
    <button on:click={editNode}>Edit Node</button>
  </div>
  <div id="layoutMenu">
    <button on:click={() => setLayout('horizontal')}>Horizontal</button>
    <button on:click={() => setLayout('vertical')}>Vertical</button>
    <div>
      <label>Force Strength:</label>
      <input 
        type="range" 
        min="10" 
        max="300" 
        value="100" 
        on:input={(e) => updateForceStrength(e.currentTarget.value)}
      >
    </div>
  </div>
{/if}

<div id="editDialog" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
  <div id="summernote"></div>
  <button on:click={saveEdit}>Save</button>
  <button on:click={closeEdit}>Cancel</button>
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
</style>
<script lang="ts">
  import MindMap from './MindMap.svelte';
  import MindMapControls from './MindMapControls.svelte';
  import type { Node, Link } from '$lib/types';

  export let nodes: Node[] = [];
  export let links: Link[] = [];
  export let mindmapId: string;

  let zoomLevel = 100;
  let currentLevel = 2;

  function handleZoomIn() {
    // Implement zoom in logic
    zoomLevel = Math.min(zoomLevel * 1.2, 300);
    updateZoom();
  }

  function handleZoomOut() {
    // Implement zoom out logic
    zoomLevel = Math.max(zoomLevel * 0.8, 10);
    updateZoom();
  }

  function handleResetZoom() {
    // Implement reset zoom logic
    zoomLevel = 100;
    updateZoom();
  }

  function handleLevelChange(event) {
    currentLevel = event.detail.level;
    // Implement level change logic
  }

  function updateZoom() {
    // Update zoom in MindMap component
    // This function should be implemented in MindMap.svelte and exposed as a prop or through a store
  }
</script>

<div class="relative w-full h-[600px]">
  <MindMap {nodes} {links} {mindmapId} bind:zoomLevel bind:currentLevel />
  <MindMapControls
    {zoomLevel}
    {currentLevel}
    on:zoomIn={handleZoomIn}
    on:zoomOut={handleZoomOut}
    on:resetZoom={handleResetZoom}
    on:levelChange={handleLevelChange}
  />
</div>

<style>
  .relative {
    position: relative;
  }
</style>


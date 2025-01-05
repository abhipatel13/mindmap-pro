<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let zoomLevel = 100;
  export let currentLevel = 2;

  function handleZoomIn() {
    dispatch('zoomIn');
  }

  function handleZoomOut() {
    dispatch('zoomOut');
  }

  function handleResetZoom() {
    dispatch('resetZoom');
  }

  function handleLevelChange(event) {
    currentLevel = parseInt(event.target.value);
    dispatch('levelChange', { level: currentLevel });
  }
</script>

<div class="controls">
  <div class="zoom-controls">
    <button on:click={handleZoomIn}>+</button>
    <button on:click={handleZoomOut}>-</button>
    <button on:click={handleResetZoom}>Reset</button>
    <div id="zoom-level">Zoom: {zoomLevel}%</div>
  </div>
  <div class="level-controls">
    <label for="level-select">Level:</label>
    <select id="level-select" bind:value={currentLevel} on:change={handleLevelChange}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
  </div>
</div>

<style>
  .controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>


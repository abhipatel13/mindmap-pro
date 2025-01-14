<script lang="ts">
  import { supabase } from '$lib/supabase';
  import MindMap from '$lib/components/MindMap.svelte';

  // Test data
  let nodes = [
    { id: "0", name: "Root", content: "Root Node" },
    { id: "1", name: "Child 1", content: "First Child" },
    { id: "2", name: "Child 2", content: "Second Child" }
  ];

  let links = [
    { source: "0", target: "1" },
    { source: "0", target: "2" }
  ];

  let mindmapId = "test";

  function updateNodePosition(node: any) {
    console.log('Node position updated:', node);
  }
</script>

<div class="w-full h-screen">
  <MindMap
  />
</div>
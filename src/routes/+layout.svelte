<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import Nav from '$lib/components/Nav.svelte';

  let isLoading = true;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      } else if (event === 'SIGNED_IN') {
        window.location.href = '/mindmaps';
      }
    });

    isLoading = false;
  });
</script>

<div class="min-h-screen bg-white">
  <Nav />
  <main>
    {#if !isLoading}
      <slot />
    {/if}
  </main>
</div>
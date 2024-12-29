<script lang="ts">
  import { currentRoute } from '../router';
  import { supabase } from '../supabase';
  import Nav from './Nav.svelte';
</script>

<div class="min-h-screen bg-white">
  <Nav />
  <main>
    <slot />
  </main>
</div>
<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../router';
  import { supabase } from '../supabase';
  import Home from '../../routes/+page.svelte';
  import Login from '../../routes/login/+page.svelte';
  import Register from '../../routes/register/+page.svelte';
  import Mindmaps from '../../routes/mindmaps/+page.svelte';

  let isAuthenticated = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    isAuthenticated = !!session;

    // Redirect if trying to access protected routes while not authenticated
    if (!isAuthenticated && $currentRoute === '/mindmaps') {
      window.location.href = '/login';
    }

    // Redirect if trying to access auth routes while authenticated
    if (isAuthenticated && ['/login', '/register'].includes($currentRoute)) {
      window.location.href = '/mindmaps';
    }
  });
</script>

{#if $currentRoute === '/'}
  <Home />
{:else if $currentRoute === '/login'}
  <Login />
{:else if $currentRoute === '/register'}
  <Register />
{:else if $currentRoute === '/mindmaps' && isAuthenticated}
  <Mindmaps />
{/if}
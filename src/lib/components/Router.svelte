<script>
  import { currentRoute } from '../router';
  import Home from '../../routes/+page.svelte';
  import Login from '../../routes/login/+page.svelte';
  import Register from '../../routes/register/+page.svelte';
  import Mindmaps from '../../routes/mindmaps/+page.svelte';
</script>

{#if $currentRoute === '/'}
  <Home />
{:else if $currentRoute === '/login'}
  <Login />
{:else if $currentRoute === '/register'}
  <Register />
{:else if $currentRoute === '/mindmaps'}
  <Mindmaps />
{/if}
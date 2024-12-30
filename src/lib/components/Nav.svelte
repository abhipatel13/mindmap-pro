<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let isLoggedIn = false;
  let loading = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    isLoggedIn = !!session;

    supabase.auth.onAuthStateChange((_event, session) => {
      isLoggedIn = !!session;
    });
  });

  async function handleLogout() {
    try {
      loading = true;
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      loading = false;
    }
  }
</script>

<nav class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <a href="/" class="flex items-center">
          <span class="text-2xl font-bold text-indigo-600">MindFlow</span>
        </a>
      </div>

      <div class="flex items-center">
        {#if isLoggedIn}
          <a 
            href="/mindmaps" 
            class="mr-4 text-gray-700 hover:text-indigo-600"
          >
            My Mindmaps
          </a>
          <button
            on:click={handleLogout}
            disabled={loading}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        {:else}
          <a
            href="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </a>
          <a
            href="/register"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
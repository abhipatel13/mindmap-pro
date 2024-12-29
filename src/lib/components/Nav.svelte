<script lang="ts">
  import { currentRoute } from '../router';
  import { supabase } from '../supabase';
</script>

<nav class="bg-white border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="#/" class="text-xl font-bold text-indigo-600">MindFlow</a>
        </div>
      </div>
      <div class="flex items-center">
        {#if $currentRoute === '/'}
          <a 
            href="#/login"
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Sign In
          </a>
          <a
            href="#/register"
            class="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign Up Free
          </a>
        {:else if $currentRoute !== '/login' && $currentRoute !== '/register'}
          <a href="#/mindmaps" class="text-gray-600 hover:text-gray-900 px-3 py-2">My Mindmaps</a>
          <button
            on:click={() => supabase.auth.signOut()}
            class="ml-4 text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Sign Out
          </button>
        {/if}
      </div>
    </div>
  </div>
</nav>
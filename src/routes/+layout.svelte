<script lang="ts">
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import '../app.css';

  let userEmail = '';
  let showProfile = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    userEmail = session?.user?.email || '';
  });
</script>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex">
          <a href="/" class="flex items-center">
            <span class="text-xl font-bold text-indigo-600">MindMap</span>
          </a>
        </div>

        <!-- User Profile Section -->
        <div class="flex items-center">
          <div class="relative">
            <button
              on:click={() => showProfile = !showProfile}
              class="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm text-gray-700">{userEmail}</span>
            </button>

            {#if showProfile}
              <div 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
                on:mouseleave={() => showProfile = false}
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b">
                  Signed in as<br/>
                  <span class="font-medium">{userEmail}</span>
                </div>
                <a 
                  href="/auth/signout" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </a>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <slot />
  </main>
</div>

<style>
  /* Add any additional styles here */
  .relative {
    position: relative;
  }

  .absolute {
    position: absolute;
    z-index: 50;
  }
</style>
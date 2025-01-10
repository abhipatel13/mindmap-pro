<script lang="ts">
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import InviteModal from '$lib/components/InviteModal.svelte';
  import '../app.css';

  let userEmail = '';
  let showProfile = false;
  let showInviteModal = false;
  let isDropdownOpen = false;

  // Check if current route is a mindmap page
  $: isMindmapPage = $page.url.pathname.startsWith('/mindmaps/');

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    userEmail = session?.user?.email || '';
  });

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await goto('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    const dropdown = document.getElementById('logo-dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      isDropdownOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center space-x-4">
          <!-- Logo -->
          <a href="/" class="flex items-center">
            <span class="text-xl font-bold text-indigo-600">MindMap</span>
          </a>

          <!-- Dropdown -->
          {#if isMindmapPage}
            <div class="relative">
              <button
                on:click|stopPropagation={toggleDropdown}
                class="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              {#if isDropdownOpen}
                <div
                  id="logo-dropdown"
                  class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <button
                      on:click={() => {
                        showInviteModal = true;
                        isDropdownOpen = false;
                      }}
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Share Mindmap
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
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
                <button 
                  on:click={handleSignOut}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
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

<InviteModal
  mindmapId={$page.params.id}
  show={showInviteModal}
  on:close={() => showInviteModal = false}
/>

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
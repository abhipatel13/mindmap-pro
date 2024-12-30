<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { MindMap } from '$lib/types';

  let mindmaps: MindMap[] = [];
  let loading = true;
  let error = '';
  let newMindmapTitle = '';
  let creating = false;

  onMount(() => {
    loadMindmaps();
  });

  async function loadMindmaps() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      mindmaps = data || [];
    } catch (err: any) {
      error = err.message;
      console.error('Error loading mindmaps:', err);
    } finally {
      loading = false;
    }
  }

  async function createMindmap() {
    if (!newMindmapTitle.trim() || creating) return;

    try {
      creating = true;
      error = '';
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('mindmaps')
        .insert([
          {
            title: newMindmapTitle.trim(),
            owner_id: user.id
          }
        ])
        .select()
        .single();

      if (err) throw err;
      if (!data) throw new Error('Failed to create mindmap');

      mindmaps = [data, ...mindmaps];
      newMindmapTitle = '';
    } catch (err: any) {
      error = err.message;
      console.error('Error creating mindmap:', err);
    } finally {
      creating = false;
    }
  }

  async function deleteMindmap(id: string) {
    if (!confirm('Are you sure you want to delete this mindmap?')) return;

    try {
      error = '';
      const { error: err } = await supabase
        .from('mindmaps')
        .delete()
        .match({ id });

      if (err) throw err;
      mindmaps = mindmaps.filter(m => m.id !== id);
    } catch (err: any) {
      error = err.message;
      console.error('Error deleting mindmap:', err);
    }
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900">My Mindmaps</h1>
    </div>

    <div class="bg-white shadow sm:rounded-lg p-4">
      <form on:submit|preventDefault={createMindmap} class="flex gap-4">
        <input
          type="text"
          bind:value={newMindmapTitle}
          placeholder="Enter mindmap title"
          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <button
          type="submit"
          disabled={creating || !newMindmapTitle.trim()}
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create New Mindmap'}
        </button>
      </form>
    </div>

    {#if error}
      <div class="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
        <p class="text-sm text-red-700">{error}</p>
      </div>
    {/if}

    {#if loading}
      <div class="text-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {:else if mindmaps.length === 0}
      <div class="text-center py-12">
        <h3 class="text-lg font-medium text-gray-900">No mindmaps yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first mindmap!</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each mindmaps as mindmap}
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    <a href={`/mindmaps/${mindmap.id}`} class="hover:text-indigo-600">
                      {mindmap.title}
                    </a>
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Created {new Date(mindmap.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  on:click={() => deleteMindmap(mindmap.id)}
                  class="text-gray-400 hover:text-red-600"
                  title="Delete mindmap"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
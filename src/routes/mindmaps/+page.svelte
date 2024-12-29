<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { MindMap } from '$lib/types';

  let mindmaps: MindMap[] = [];
  let loading = true;
  let error = '';
  let newMindmapTitle = '';

  async function loadMindmaps() {
    try {
      const { data, error: err } = await supabase
        .from('mindmaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      mindmaps = data;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function createMindmap() {
    if (!newMindmapTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('mindmaps')
        .insert([
          {
            title: newMindmapTitle,
            owner_id: user.id
          }
        ])
        .select()
        .single();

      if (err) throw err;
      mindmaps = [data, ...mindmaps];
      newMindmapTitle = '';
    } catch (err: any) {
      error = err.message;
    }
  }


</script>

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
        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create New Mindmap
      </button>
    </form>
  </div>

  {#if error}
    <div class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="text-center">
      <p class="text-gray-500">Loading mindmaps...</p>
    </div>
  {:else if mindmaps.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500">No mindmaps yet. Create your first one!</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each mindmaps as mindmap}
        <a
          href={`/mindmaps/${mindmap.id}`}
          class="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 truncate">{mindmap.title}</h3>
            <p class="mt-1 text-sm text-gray-500">
              Created {new Date(mindmap.created_at).toLocaleDateString()}
            </p>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
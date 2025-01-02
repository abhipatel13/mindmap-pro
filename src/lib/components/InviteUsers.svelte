<script lang="ts">
  import { supabase } from '$lib/supabase';

  export let mindmapId: string;
  
  let email = '';
  let role = 'editor';
  let error = '';
  let success = '';
  let collaborators: any[] = [];

  // Load existing collaborators
  async function loadCollaborators() {
    const { data, error } = await supabase
      .from('mindmap_collaborators')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('mindmap_id', mindmapId);

    if (data) {
      collaborators = data;
      console.log('Collaborators:', collaborators);
    }
  }

  // Invite new user
  async function inviteUser() {
    error = '';
    success = '';

    // First, check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      error = 'User not found. They need to register first.';
      return;
    }

    // Check if already a collaborator
    const { data: existingCollab } = await supabase
      .from('mindmap_collaborators')
      .select()
      .match({ mindmap_id: mindmapId, user_id: userData.id })
      .single();

    if (existingCollab) {
      error = 'User is already a collaborator';
      return;
    }

    // Add collaborator
    const { error: collabError } = await supabase
      .from('mindmap_collaborators')
      .insert({
        mindmap_id: mindmapId,
        user_id: userData.id,
        role
      });

    if (collabError) {
      error = collabError.message;
    } else {
      success = 'User invited successfully!';
      email = '';
      await loadCollaborators();
    }
  }

  // Remove collaborator
  async function removeCollaborator(userId: string) {
    const { error: removeError } = await supabase
      .from('mindmap_collaborators')
      .delete()
      .match({ mindmap_id: mindmapId, user_id: userId });

    if (removeError) {
      error = removeError.message;
    } else {
      await loadCollaborators();
    }
  }

  // Load collaborators on mount
  $: if (mindmapId) {
    loadCollaborators();
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-lg">
  <h2 class="text-xl font-bold mb-4">Invite Collaborators</h2>

  <form on:submit|preventDefault={inviteUser} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        bind:value={email}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="user@example.com"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Role</label>
      <select
        bind:value={role}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
      </select>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Invite User
    </button>

    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    {#if success}
      <p class="text-green-500 text-sm">{success}</p>
    {/if}
  </form>

  {#if collaborators.length > 0}
    <div class="mt-8">
      <h3 class="text-lg font-medium mb-4">Current Collaborators</h3>
      <ul class="space-y-3">
        {#each collaborators as collab}
          <li class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
            <div>
              <span class="text-gray-900">{collab.user.email}</span>
              <span class="ml-2 text-sm text-gray-500">({collab.role})</span>
            </div>
            <button
              on:click={() => removeCollaborator(collab.user_id)}
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div> 
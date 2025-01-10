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

<div class="p-6">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Invite Collaborators</h2>
  
  <div class="space-y-6">
    <!-- Invite Form -->
    <div class="bg-white rounded-lg">
      <div class="space-y-4">
        <div>
          <label for="invite-email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="invite-email"
            type="email"
            bind:value={email}
            placeholder="Enter collaborator's email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="invite-role" class="block text-sm font-medium text-gray-700">
            Access Level
          </label>
          <select
            id="invite-role"
            bind:value={role}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="viewer">Viewer (can only view)</option>
            <option value="editor">Editor (can edit)</option>
          </select>
        </div>

        {#if error || success}
          <div class="mt-2">
            {#if error}
              <p class="text-sm text-red-600">{error}</p>
            {/if}
            {#if success}
              <p class="text-sm text-green-600">{success}</p>
            {/if}
          </div>
        {/if}

        <button
          type="button"
          on:click={inviteUser}
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send Invitation
        </button>
      </div>
    </div>

    <!-- Collaborators List -->
    {#if collaborators.length > 0}
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Current Collaborators</h3>
        <div class="space-y-3">
          {#each collaborators as collab}
            <div class="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">{collab.user.email}</span>
                <span class="text-xs text-gray-500 capitalize">{collab.role}</span>
              </div>
              <button
                on:click={() => removeCollaborator(collab.user_id)}
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Remove previous styles as we're using Tailwind classes */
</style> 
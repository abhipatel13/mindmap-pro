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

<div class="add-node-container">
  <div class="add-node-form">
    <div class="form-row">
      <div class="input-group">
        <label for="invite-email">Email:</label>
        <input
          id="invite-email"
          type="email"
          bind:value={email}
          placeholder="Enter email to invite"
          class="input-field"
        />
      </div>
      
      <div class="input-group">
        <label for="invite-role">Role:</label>
        <select
          id="invite-role"
          bind:value={role}
          class="select-field"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
      </div>

      <button
        type="button"
        on:click={inviteUser}
        class="add-btn"
      >
        Invite User
      </button>
    </div>

    {#if error || success}
      <div class="message-container">
        {#if error}
          <p class="error-message">{error}</p>
        {/if}
        {#if success}
          <p class="success-message">{success}</p>
        {/if}
      </div>
    {/if}
  </div>

  {#if collaborators.length > 0}
    <div class="collaborators-list">
      <h3 class="list-title">Current Collaborators</h3>
      <div class="collaborators">
        {#each collaborators as collab}
          <div class="collaborator-item">
            <div class="collaborator-info">
              <span class="email">{collab.user.email}</span>
              <span class="role">{collab.role}</span>
            </div>
            <button
              on:click={() => removeCollaborator(collab.user_id)}
              class="remove-btn"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  :root {
    --theme-color: rgb(67 56 202);
    --theme-color-dark: rgb(55 48 163);
    --theme-color-light: rgb(224 231 255);
  }

  .add-node-container {
    width: 100%;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .add-node-form {
    width: 100%;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .form-row {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: flex-end;
  }

  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .input-group label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .input-field, .select-field {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
  }

  .add-btn {
    height: 40px;
    padding: 0 24px;
    background-color: var(--theme-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  .add-btn:hover {
    background-color: var(--theme-color-dark);
  }

  .message-container {
    margin-top: 12px;
  }

  .error-message {
    color: #dc2626;
    font-size: 14px;
  }

  .success-message {
    color: #059669;
    font-size: 14px;
  }

  .collaborators-list {
    padding: 20px;
  }

  .list-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }

  .collaborators {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .collaborator-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #f9fafb;
    border-radius: 4px;
  }

  .collaborator-info {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .email {
    font-size: 14px;
    color: #374151;
  }

  .role {
    font-size: 12px;
    color: #6b7280;
    padding: 2px 8px;
    background-color: #e5e7eb;
    border-radius: 12px;
  }

  .remove-btn {
    padding: 4px 12px;
    background-color: var(--theme-color-light);
    color: var(--theme-color);
    border: 1px solid var(--theme-color);
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .remove-btn:hover {
    background-color: var(--theme-color);
    color: white;
  }
</style> 
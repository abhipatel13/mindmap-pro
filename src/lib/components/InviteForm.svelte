<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    let email = '';
  
    function handleSubmit() {
      dispatch('invite', email);
      email = '';
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="flex items-center space-x-2">
    <input
      type="email"
      bind:value={email}
      placeholder="Enter email to invite"
      class="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Invite
    </button>
  </form>
  
  
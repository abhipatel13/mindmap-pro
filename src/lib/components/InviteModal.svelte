<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import InviteUsers from './InviteUsers.svelte';

  export let mindmapId: string;
  export let show = false;

  const dispatch = createEventDispatcher();

  function handleClickOutside(event: MouseEvent) {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && !modalContent.contains(event.target as Node)) {
      dispatch('close');
    }
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    on:click={handleClickOutside}
  >
    <div class="modal-content relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <InviteUsers {mindmapId} />
    </div>
  </div>
{/if} 
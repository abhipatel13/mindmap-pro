<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let isLoggedIn = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    isLoggedIn = !!session;
  });

  function handleGetStarted() {
    window.location.href = isLoggedIn ? '/mindmaps' : '/register';
  }
  
  function handleSignIn() {
    window.location.href = '/login';
  }
</script>

<section class="relative bg-gradient-to-b from-indigo-50 to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
    <div class="text-center">
      <h1 class="text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
        Transform Your Ideas with
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          MindFlow
        </span>
      </h1>
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
        Create beautiful mind maps collaboratively. Share ideas, organize thoughts, and work together in real-time with our intuitive platform.
      </p>
      <div class="flex justify-center gap-6">
        <button
          on:click={handleGetStarted}
          class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-semibold transform transition hover:scale-105 shadow-lg"
        >
          {isLoggedIn ? 'Go to Mindmaps' : 'Get Started Free'}
        </button>
        {#if !isLoggedIn}
          <button
            on:click={handleSignIn}
            class="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 font-semibold border-2 border-gray-200 transform transition hover:scale-105 shadow-sm"
          >
            Sign In
          </button>
        {/if}
      </div>
    </div>
  </div>
</section>
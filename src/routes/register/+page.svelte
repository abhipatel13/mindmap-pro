<script lang="ts">
  import { supabase } from '$lib/supabase';

  let email = '';
  let password = '';
  let username = '';
  let fullName = '';
  let loading = false;
  let error = '';

  async function handleRegister() {
    try {
      loading = true;
      error = '';
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already taken');
      }

      // Sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Update profile with username and full_name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username,
            full_name: fullName,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        console.log('User registered:', user);
        
        window.location.href = '/mindmaps';
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Create your account
    </h2>
    <p class="mt-2 text-center text-sm text-gray-600">
      Or
      <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
        sign in to your account
      </a>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" on:submit|preventDefault={handleRegister}>
        {#if error}
          <div class="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        {/if}

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              bind:value={email}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div class="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              required
              bind:value={username}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div class="mt-1">
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              bind:value={fullName}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              bind:value={password}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            {/if}
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
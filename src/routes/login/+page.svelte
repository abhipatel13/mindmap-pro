<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { navigate } from '$lib/router';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin() {
    try {
      loading = true;
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (err) throw err;
      navigate('/mindmaps');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<!-- Rest of the component remains the same -->
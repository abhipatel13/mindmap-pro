<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { navigate } from '$lib/router';

  let email = '';
  let password = '';
  let username = '';
  let fullName = '';
  let loading = false;
  let error = '';

  async function handleRegister() {
    try {
      loading = true;
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username,
              full_name: fullName,
            }
          ]);

        if (profileError) throw profileError;
      }

      navigate('/mindmaps');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>


<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-semibold text-gray-900">Register</h1>
  </div>
</div>
<!-- Rest of the component remains the same -->
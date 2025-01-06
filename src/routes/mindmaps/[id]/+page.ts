import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function load({ params }) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw error(401, 'Authentication failed');
    if (!user) throw error(401, 'Not authenticated');

    // Get mindmap with nodes
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select(`
        *,
        mindmap_nodes (*)
      `)
      .eq('id', params.id)
      .single();

    if (mindmapError) {
      console.error('Mindmap fetch error:', mindmapError);
      throw error(404, 'Mindmap not found');
    }

    if (!mindmap) throw error(404, 'Mindmap not found');

    // Check collaboration access
    const { data: collaborator, error: collabError } = await supabase
      .from('mindmap_collaborators')
      .select('*')
      .eq('mindmap_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (mindmap.owner_id !== user.id && !collaborator) {
      throw error(403, 'Access denied');
    }

    return {
      mindmap,
      nodes: mindmap.mindmap_nodes || [],
      isOwner: mindmap.owner_id === user.id,
      user
    };

  } catch (err: any) {
    console.error('Load error:', err);
    throw error(500, err.message || 'Failed to load mindmap');
  }
}
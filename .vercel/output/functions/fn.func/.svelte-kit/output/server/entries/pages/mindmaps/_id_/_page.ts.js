import { r as redirect } from "../../../../chunks/index2.js";
import { s as supabase } from "../../../../chunks/supabase.js";
async function load({ params }) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw redirect(303, "/login");
    }
    const { data: mindmap, error: mindmapError } = await supabase.from("mindmaps").select(`
        *,
        mindmap_nodes (*)
      `).eq("id", params.id).single();
    if (mindmapError) {
      throw redirect(303, "/");
    }
    if (!mindmap) {
      throw redirect(303, "/");
    }
    const { data: collaborator } = await supabase.from("mindmap_collaborators").select("*").eq("mindmap_id", params.id).eq("user_id", session.user.id).single();
    if (mindmap.owner_id !== session.user.id && !collaborator) {
      throw redirect(303, "/");
    }
    return {
      mindmap,
      nodes: mindmap.mindmap_nodes || [],
      isOwner: mindmap.owner_id === session.user.id,
      user: session.user
    };
  } catch (err) {
    if (err instanceof redirect) throw err;
    throw redirect(303, "/login");
  }
}
export {
  load
};

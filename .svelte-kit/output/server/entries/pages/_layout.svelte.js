import { S as ensure_array_like, T as bind_props, R as pop, P as push, V as fallback, W as store_get, X as slot, Y as unsubscribe_stores } from "../../chunks/index.js";
import { p as page } from "../../chunks/stores.js";
import { s as supabase } from "../../chunks/supabase.js";
import "../../chunks/client.js";
import { a as attr } from "../../chunks/attributes.js";
import { e as escape_html } from "../../chunks/escaping.js";
function InviteUsers($$payload, $$props) {
  push();
  let mindmapId = $$props["mindmapId"];
  let email = "";
  let collaborators = [];
  async function loadCollaborators() {
    const { data, error } = await supabase.from("mindmap_collaborators").select(`
        *,
        user:user_id (
          email
        )
      `).eq("mindmap_id", mindmapId);
    if (data) {
      collaborators = data;
    }
  }
  if (mindmapId) {
    loadCollaborators();
  }
  $$payload.out += `<div class="p-6"><h2 class="text-lg font-semibold text-gray-900 mb-4">Invite Collaborators</h2> <div class="space-y-6"><div class="bg-white rounded-lg"><div class="space-y-4"><div><label for="invite-email" class="block text-sm font-medium text-gray-700">Email address</label> <input id="invite-email" type="email"${attr("value", email)} placeholder="Enter collaborator's email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></div> <div><label for="invite-role" class="block text-sm font-medium text-gray-700">Access Level</label> <select id="invite-role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"><option value="viewer">Viewer (can only view)</option><option value="editor">Editor (can edit)</option></select></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <button type="button" class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Send Invitation</button></div></div> `;
  if (collaborators.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(collaborators);
    $$payload.out += `<div class="mt-8"><h3 class="text-lg font-medium text-gray-900 mb-4">Current Collaborators</h3> <div class="space-y-3"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let collab = each_array[$$index];
      $$payload.out += `<div class="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"><div class="flex flex-col"><span class="text-sm font-medium text-gray-900">${escape_html(collab.user.email)}</span> <span class="text-xs text-gray-500 capitalize">${escape_html(collab.role)}</span></div> <button class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Remove</button></div>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div>`;
  bind_props($$props, { mindmapId });
  pop();
}
function InviteModal($$payload, $$props) {
  push();
  let mindmapId = $$props["mindmapId"];
  let show = fallback($$props["show"], false);
  if (show) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"><div class="modal-content relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">`;
    InviteUsers($$payload, { mindmapId });
    $$payload.out += `<!----></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { mindmapId, show });
  pop();
}
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  let isMindmapPage;
  let userEmail = "";
  let showInviteModal = false;
  isMindmapPage = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/mindmaps/");
  $$payload.out += `<div class="min-h-screen bg-gray-100"><nav class="bg-white shadow"><div class="max-w-7xl mx-auto px-4"><div class="flex justify-between h-16"><div class="flex items-center space-x-4"><a href="/" class="flex items-center"><span class="text-xl font-bold text-indigo-600">MindMap</span></a> `;
  if (isMindmapPage) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="relative svelte-1af0y5q"><button class="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button> `;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="flex items-center"><div class="relative svelte-1af0y5q"><button class="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> <span class="text-sm text-gray-700">${escape_html(userEmail)}</span></button> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div></div></div></nav> <main><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main></div> `;
  InviteModal($$payload, {
    mindmapId: store_get($$store_subs ??= {}, "$page", page).params.id,
    show: showInviteModal
  });
  $$payload.out += `<!---->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};

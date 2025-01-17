import { a as attr } from "../../../chunks/attributes.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { R as pop, P as push } from "../../../chunks/index.js";
import "../../../chunks/supabase.js";
function _page($$payload, $$props) {
  push();
  let newMindmapTitle = "";
  $$payload.out += `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="space-y-6"><div class="flex justify-between items-center"><h1 class="text-2xl font-semibold text-gray-900">My Mindmaps</h1></div> <div class="bg-white shadow sm:rounded-lg p-4"><form class="flex gap-4"><input type="text"${attr("value", newMindmapTitle)} placeholder="Enter mindmap title" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"> <button type="submit"${attr("disabled", !newMindmapTitle.trim(), true)} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">${escape_html("Create New Mindmap")}</button></form></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-12"><svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  pop();
}
export {
  _page as default
};

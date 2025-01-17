import "clsx";
import "../../../../chunks/supabase.js";
import { _ as current_component, W as store_get, $ as head, Y as unsubscribe_stores, R as pop, P as push } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/stores.js";
import { createClient } from "@supabase/supabase-js";
import "../../../../chunks/client.js";
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
const supabaseUrl = "https://fodqbncqvugtdiugukgv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZHFibmNxdnVndGRpdWd1a2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDYxMzksImV4cCI6MjA1MDk4MjEzOX0.bKcQoYy_XprQ1krc8Ox8yf7ihmEgxl9_aQUaKzG7LoU";
createClient(supabaseUrl, supabaseAnonKey);
function MindMap($$payload, $$props) {
  push();
  var $$store_subs;
  onDestroy(() => {
  });
  store_get($$store_subs ??= {}, "$page", page).params.id;
  head($$payload, ($$payload2) => {
    $$payload2.out += `<script src="https://d3js.org/d3.v3.min.js"><\/script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"> <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet"> <script src="https://code.jquery.com/jquery-3.5.1.min.js"><\/script> <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"><\/script>`;
  });
  $$payload.out += `<div id="chart" style="width: 100%; height: calc(100vh - 64px);" class="svelte-1lhqw0u">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div id="editDialog" style="display: none;" class="editor-dialog svelte-1lhqw0u"><div class="editor-content svelte-1lhqw0u"><div id="summernote"></div> <div class="dialog-buttons"><button>Save</button> <button>Cancel</button></div></div></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function _page($$payload) {
  $$payload.out += `<div class="w-full h-screen">`;
  MindMap($$payload);
  $$payload.out += `<!----></div>`;
}
export {
  _page as default
};

import "clsx";
import { e as escape_html } from "../../chunks/escaping.js";
import { R as pop, P as push } from "../../chunks/index.js";
import "../../chunks/supabase.js";
function Hero($$payload, $$props) {
  push();
  $$payload.out += `<section class="relative bg-gradient-to-b from-indigo-50 to-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"><div class="text-center"><h1 class="text-6xl font-extrabold text-gray-900 mb-8 leading-tight">Transform Your Ideas with <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">MindFlow</span></h1> <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">Create beautiful mind maps collaboratively. Share ideas, organize thoughts, and work together in real-time with our intuitive platform.</p> <div class="flex justify-center gap-6"><button class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-semibold transform transition hover:scale-105 shadow-lg">${escape_html("Get Started Free")}</button> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<button class="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 font-semibold border-2 border-gray-200 transform transition hover:scale-105 shadow-sm">Sign In</button>`;
  }
  $$payload.out += `<!--]--></div></div></div></section>`;
  pop();
}
function Features($$payload) {
  $$payload.out += `<section class="bg-white py-24"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Why Choose MindFlow?</h2> <p class="text-xl text-gray-600 max-w-2xl mx-auto">Experience the power of visual thinking with our innovative features</p></div> <div class="grid md:grid-cols-3 gap-12"><div class="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-lg transform transition hover:scale-105"><div class="w-12 h-12 bg-indigo-600 rounded-lg mb-6 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div> <h3 class="text-xl font-bold text-gray-900 mb-4">Real-time Collaboration</h3> <p class="text-gray-600 leading-relaxed">Work together seamlessly with your team. See changes instantly as they happen and collaborate effortlessly.</p></div> <div class="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg transform transition hover:scale-105"><div class="w-12 h-12 bg-purple-600 rounded-lg mb-6 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></div> <h3 class="text-xl font-bold text-gray-900 mb-4">Intuitive Interface</h3> <p class="text-gray-600 leading-relaxed">Easy-to-use interface that makes mind mapping a breeze. Start creating beautiful mind maps in seconds.</p></div> <div class="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl shadow-lg transform transition hover:scale-105"><div class="w-12 h-12 bg-pink-600 rounded-lg mb-6 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div> <h3 class="text-xl font-bold text-gray-900 mb-4">Secure &amp; Reliable</h3> <p class="text-gray-600 leading-relaxed">Your data is safe with us. Enterprise-grade security and reliable cloud storage you can trust.</p></div></div></div></section>`;
}
function _page($$payload) {
  $$payload.out += `<div class="w-full">`;
  Hero($$payload);
  $$payload.out += `<!----> `;
  Features($$payload);
  $$payload.out += `<!----></div>`;
}
export {
  _page as default
};

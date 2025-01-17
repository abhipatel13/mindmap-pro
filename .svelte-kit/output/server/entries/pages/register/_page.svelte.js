import { a as attr } from "../../../chunks/attributes.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { R as pop, P as push } from "../../../chunks/index.js";
import "../../../chunks/supabase.js";
function _page($$payload, $$props) {
  push();
  let email = "";
  let password = "";
  let username = "";
  let fullName = "";
  let loading = false;
  $$payload.out += `<div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50"><div class="sm:mx-auto sm:w-full sm:max-w-md"><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2> <p class="mt-2 text-center text-sm text-gray-600">Or <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">sign in to your account</a></p></div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"><div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"><form class="space-y-6">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div><label for="email" class="block text-sm font-medium text-gray-700">Email address</label> <div class="mt-1"><input id="email" name="email" type="email" required${attr("value", email)} class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></div></div> <div><label for="username" class="block text-sm font-medium text-gray-700">Username</label> <div class="mt-1"><input id="username" name="username" type="text" required${attr("value", username)} class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></div></div> <div><label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label> <div class="mt-1"><input id="fullName" name="fullName" type="text" required${attr("value", fullName)} class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></div></div> <div><label for="password" class="block text-sm font-medium text-gray-700">Password</label> <div class="mt-1"><input id="password" name="password" type="password" required${attr("value", password)} class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></div></div> <div><button type="submit"${attr("disabled", loading, true)} class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> ${escape_html("Register")}</button></div></form></div></div></div>`;
  pop();
}
export {
  _page as default
};

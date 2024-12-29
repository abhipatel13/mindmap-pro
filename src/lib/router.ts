import { writable } from 'svelte/store';

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  mindmaps: '/mindmaps'
};

export const currentRoute = writable(window.location.hash.slice(1) || '/');

window.addEventListener('hashchange', () => {
  currentRoute.set(window.location.hash.slice(1) || '/');
});

export function navigate(path) {
  window.location.hash = path;
}

// Initialize the route
if (typeof window !== 'undefined' && !window.location.hash) {
  window.location.hash = '/';
}
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: '/src/lib'
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
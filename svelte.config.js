import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const production = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
        hydratable: !production,
        legacy: {
          componentApi: true          
        }
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        compatModuleInterop: false,
      },
    },
    target: 'esnext',
  }
});
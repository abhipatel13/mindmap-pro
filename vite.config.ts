import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({
    compilerOptions: {
      compatibility:{
        componentApi: 4
      }
    }
  })],
  resolve: {
    alias: {
      $lib: '/src/lib'
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
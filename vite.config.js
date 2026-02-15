import { defineConfig } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/wordle/",
  plugins: [svelte({
    preprocess: vitePreprocess()
  })],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log'] // Remove specific functions
      }
    },
    rollupOptions: {
      output: {
        assetFileNames: `[name]-v${version}.[ext]`,
        entryFileNames: `[name]-v${version}.js`,
        dir: "./dist",
        manualChunks: {
          // Split vendor code
          'vendor': ['svelte', 'svelte/store', 'svelte/transition'],
          // Split word list (largest data)
          'words': ['./src/words_5.ts'],
        }
      }
    },
    chunkSizeWarningLimit: 500 // Increase limit for word list
  }
});

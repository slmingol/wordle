import { defineConfig } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import viteCompression from 'vite-plugin-compression';
import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/wordle/",
  css: {
    preprocessorOptions: {
      scss: {
        // Use modern Sass API to avoid deprecation warnings
        api: 'modern-compiler',
        // Silence deprecation warnings if needed
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  plugins: [
    svelte({
      preprocess: vitePreprocess()
    }),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false,
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log'], // Remove specific functions
        passes: 2, // Run minification twice for better results
      },
      mangle: {
        safari10: true, // Fix Safari 10/11 issues
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate sourcemaps for debugging (can be disabled in production)
    sourcemap: false,
    // Optimize chunk size
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        assetFileNames: `[name]-v${version}.[ext]`,
        entryFileNames: `[name]-v${version}.js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        dir: "./dist",
        manualChunks: {
          // Split vendor code
          'vendor': ['svelte', 'svelte/store', 'svelte/transition'],
          // Split word list (largest data)
          'words': ['./src/words_5.ts'],
        },
        // Smaller output
        compact: true,
      },
    },
    chunkSizeWarningLimit: 500, // Increase limit for word list
    // Asset inlining threshold (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096, // 4KB
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['svelte', 'svelte/store', 'svelte/transition'],
  },
});

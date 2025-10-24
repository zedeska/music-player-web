import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(), 
VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'repeat-once.svg', 'repeat-violet.svg', 'repeat.svg'],
      manifest: {
        name: 'YAMS',
        short_name: 'YAMS',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  css : {
    postcss: "./postcss.config.js"
  },
  optimizeDeps: {
    exclude: ['metaflac.wasm'],
  },
})

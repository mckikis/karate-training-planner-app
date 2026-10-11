import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The app is published at https://mckikis.github.io/karate-training-planner-app/
const REPO_PATH = '/karate-training-planner-app/'

export default defineConfig({
  base: REPO_PATH,
  server: {
    host: true, // lets the iPhone open the dev server on the same Wi-Fi
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Karate Training Planner',
        short_name: 'Karate Planner',
        description: 'Plan karate trainings and see how long they take.',
        theme_color: '#3a3335',
        background_color: '#3a3335',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})

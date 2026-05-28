import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: 'autoUpdate',

      manifest: {

        name: 'Rytmo',

        short_name: 'Rytmo',

        description:
          'Daily OS for routines and productivity',

        theme_color: '#4F8CFF',

        background_color: '#FAFBFD',

        display: 'standalone',

        start_url: '/',

        icons: [

          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },

          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }

        ]

      }

    })

  ]

})
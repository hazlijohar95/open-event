import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create vendor chunks for large dependencies
          if (id.includes('node_modules')) {
            // TLDraw - largest dependency (PlaygroundPage)
            if (id.includes('tldraw') || id.includes('@tldraw/')) {
              return 'vendor-tldraw'
            }
            // Charts library (AnalyticsPage)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            // Core React
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            // Radix UI components
            if (id.includes('@radix-ui/')) {
              return 'vendor-radix'
            }
            // Icons
            if (id.includes('@phosphor-icons/')) {
              return 'vendor-icons'
            }
            // Convex (backend client)
            if (id.includes('convex')) {
              return 'vendor-convex'
            }
            // Markdown rendering
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('unified') || id.includes('mdast') || id.includes('micromark')) {
              return 'vendor-markdown'
            }
            // PDF generation
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
          }
          return undefined
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'Open Event',
        short_name: 'OpenEvent',
        description: 'The open-source event operations platform',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['productivity', 'business'],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Allow precaching of larger main bundle produced by Vite
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Use index.html as fallback for SPA routing - this ensures the React app
        // loads properly for all routes. Offline detection is handled in-app via usePWA hook.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api/, // API routes
          /^\/__/, // Internal routes
          /^\/.*\.[^/]+$/, // Files with extensions (assets, etc.)
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/avatars\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-avatars-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable in dev to avoid caching issues
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

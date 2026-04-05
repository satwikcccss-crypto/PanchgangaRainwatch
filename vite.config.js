import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build modes:
//   VITE_BASE=./              → relative paths (for CCCSS-SUK-dashboard embed)
//   VITE_BASE=/PanchgangaRainwatch/  → GitHub Pages standalone deploy (default)
const base = process.env.VITE_BASE || '/PanchgangaRainwatch/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/thingspeak': {
        target: 'https://api.thingspeak.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thingspeak/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor':   ['leaflet', 'react-leaflet'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    },
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['leaflet', 'chart.js']
  }
})

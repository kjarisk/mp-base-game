import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3005',
        ws: true,
        changeOrigin: true,
      },
      // Proxy auth routes
      '/login': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/guest': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/me': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/quests': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      // Also proxy any remaining assets that might be needed
      '/js': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/img': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/styles': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})

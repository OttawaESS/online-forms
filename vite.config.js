import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['bootstrap'],
          utils: ['xlsx', 'jspdf']
        }
      }
    }
  },
  server: {
    proxy: {
      '/submit': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/receipts': 'http://localhost:3000'
    }
  }
})

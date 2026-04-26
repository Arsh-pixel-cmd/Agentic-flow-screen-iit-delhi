import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 850,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('html2canvas') || id.includes('canvas-confetti')) return 'vendor-canvas';
          if (id.includes('lucide-react')) return 'vendor-icons';
        },
      },
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
    include: ['framer-motion', 'lucide-react', 'zustand', 'canvas-confetti'],
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.DS_Store'],
    },
    hmr: {
      overlay: true,
    },
  },
})

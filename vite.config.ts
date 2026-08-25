import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import path from 'path'

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(projectDirectory, './src'),
      '@components': path.resolve(projectDirectory, './src/components'),
      '@hooks': path.resolve(projectDirectory, './src/hooks'),
      '@types': path.resolve(projectDirectory, './src/types'),
      '@utils': path.resolve(projectDirectory, './src/utils'),
      '@services': path.resolve(projectDirectory, './src/services'),
      '@assets': path.resolve(projectDirectory, './src/assets'),
      '@data': path.resolve(projectDirectory, './src/data'),
      '@pages': path.resolve(projectDirectory, './src/pages'),
    },
  },
  // ← ADD THIS SECTION ↓
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      external: [
        'node:crypto',
        'node:fs',
        'node:path',
        'node:os',
        'node:http',
        'node:util',
        'node:child_process',
      ],
    },
  },
  // ← ADD THIS SECTION ↑
  server: {
    port: 3000,
    open: true,
  },
})

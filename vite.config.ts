import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    entries: [resolve(__dirname, 'index.html')],
    include: ['react-dom/client']
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for the React + TypeScript frontend.
 *
 * - Uses the official React plugin for Vite.
 * - Sets up a path alias `@` pointing to the `src` directory.
 * - Configures a development server proxy so that API calls prefixed with `/api`
 *   are forwarded to the FastAPI backend running on http://localhost:8000.
 * - Adjusts the proxy rewrite to strip the `/api` prefix before forwarding.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
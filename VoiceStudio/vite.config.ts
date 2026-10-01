import path from 'path';
import { defineConfig } from 'vite';
import app from './server/server.js';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'express-backend-bridge',
        configureServer(server) {
          // Mount the Express backend onto Vite dev server middleware
          server.middlewares.use(app);
        }
      }
    ],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

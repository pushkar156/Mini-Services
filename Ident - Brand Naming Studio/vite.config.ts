import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/ident/',
    server: {
      port: 3003,
      host: '0.0.0.0',
      fs: {
        allow: ['..']
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '/shared': path.resolve(__dirname, '../shared')
      }
    },
    plugins: [
      react(),
      {
        name: 'serve-shared-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith('/shared/')) {
              const filePath = path.join(__dirname, '..', req.url.split('?')[0]);
              if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                const mimeTypes: Record<string, string> = {
                  '.js': 'application/javascript',
                  '.css': 'text/css',
                  '.json': 'application/json',
                  '.svg': 'image/svg+xml'
                };
                res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
                return fs.createReadStream(filePath).pipe(res);
              }
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    }
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Custom plugin to add CSP headers
function cspPlugin(): Plugin {
  return {
    name: 'csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader(
          'Content-Security-Policy',
          `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https: http:;
            font-src 'self' data:;
            connect-src 'self' 
              https://api.openai.com 
              https://*.firebaseio.com 
              https://*.googleapis.com 
              https://noembed.com 
              https://www.youtube.com 
              https://youtube.com 
              wss://*.firebaseio.com;
            frame-src 'self' https://www.youtube.com;
            media-src 'self' https: http:;
            object-src 'none';
          `.replace(/\s+/g, ' ').trim()
        );
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cspPlugin()
  ],
  server: {
    port: 3001,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});

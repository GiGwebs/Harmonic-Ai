import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';

// Custom plugin to add CSP headers
function cspPlugin(): Plugin {
  return {
    name: 'csp',
    configureServer(server) {
      server.middlewares.use((_, res, next) => {
        // Development CSP - more permissive for local development tools
        const isDev = process.env.NODE_ENV !== 'production';
        const cspValue = isDev
          ? `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: chrome-extension:;
              style-src 'self' 'unsafe-inline' chrome-extension:;
              img-src 'self' blob: data: chrome-extension: https: http:;
              font-src 'self' data:;
              connect-src 'self' 
                https://api.openai.com 
                https://*.firebaseio.com 
                https://*.googleapis.com 
                wss://*.firebaseio.com
                ws://localhost:* 
                http://localhost:*;
              frame-src 'self' https://www.youtube.com;
              worker-src 'self' blob:;
              child-src 'self' blob:;
              media-src 'self' https: http:;
              object-src 'none';
            `
          : `
              default-src 'self';
              script-src 'self';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data:;
              font-src 'self' data:;
              connect-src 'self' https://api.openai.com https://*.firebaseio.com https://*.googleapis.com;
              frame-src 'self';
              worker-src 'self';
              child-src 'self';
              media-src 'self';
              object-src 'none';
            `;

        res.setHeader(
          'Content-Security-Policy',
          cspValue.replace(/\s+/g, ' ').trim()
        );
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log loaded environment variables (excluding sensitive ones)
  console.log('[Vite] Environment loaded:', {
    NODE_ENV: env.NODE_ENV,
    MODE: mode,
    hasFirebaseApiKey: !!env.VITE_FIREBASE_API_KEY,
    hasFirebaseProjectId: !!env.VITE_FIREBASE_PROJECT_ID,
    BASE_URL: env.BASE_URL
  });

  return {
    plugins: [
      react(),
      cspPlugin()
    ],
    server: {
      port: 5173,
      host: true,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Make env variables available
    define: {
      'process.env': env
    }
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_APPS_SCRIPT_URL } = loadEnv(mode, process.cwd(), '');
  const appsScriptUrl = VITE_APPS_SCRIPT_URL && new URL(VITE_APPS_SCRIPT_URL);

  return {
    plugins: [
      react(),
      {
        name: 'apps-script-dev-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!appsScriptUrl || req.method !== 'GET' || !req.url?.startsWith('/apps-script')) {
              next();
              return;
            }

            try {
              const requestUrl = new URL(req.url, 'http://localhost');
              const targetUrl = new URL(appsScriptUrl);
              targetUrl.search = requestUrl.search;
              const response = await fetch(targetUrl);
              res.statusCode = response.status;
              res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
              res.end(await response.text());
            } catch (error) {
              console.error('Apps Script development proxy failed:', error);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Apps Script request failed' }));
            }
          });
        },
      },
    ],
    server: {
      host: '0.0.0.0', // Allow external access from mobile devices
      port: 5173,
      strictPort: false,
      open: false,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});


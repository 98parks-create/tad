import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vite 개발 서버에서 /api/ai/* 요청을 처리하는 플러그인
function apiDevPlugin(env) {
  return {
    name: 'api-dev-routes',
    configureServer(server) {
      // process.env에 .env 변수 주입
      Object.keys(env).forEach(k => { if (!process.env[k]) process.env[k] = env[k]; });

      server.middlewares.use('/api/ai', async (req, res) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        await new Promise(r => req.on('end', r));

        let body = {};
        try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch {}

        const mockReq = { method: req.method, body };
        let responded = false;
        const mockRes = {
          status(code) {
            return {
              json(data) {
                if (responded) return;
                responded = true;
                res.statusCode = code;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };
          },
          json(data) {
            if (responded) return;
            responded = true;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        try {
          const route = req.url.replace(/\?.*$/, ''); // '/quote-draft', '/chat', '/report'
          const mod = await server.ssrLoadModule(`/api/ai${route}.js`);
          await mod.default(mockReq, mockRes);
        } catch (e) {
          console.error('[API Dev Error]', e.message);
          if (!responded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [
    apiDevPlugin(env),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', '192x192.png', '512x512.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'TAD B2B 견적관리',
        short_name: 'B2B 견적서',
        description: '맞춤형 자동 견적 시스템',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1600,
  },
  }
})

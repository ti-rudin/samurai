import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import history from 'connect-history-api-fallback'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  // Отладка переменных окружения
  console.log('Vite config env:', {
    VITE_STRAPI_URL: env.VITE_STRAPI_URL,
    VITE_API_URL: env.VITE_API_URL,
    mode
  })

  return {
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: true,
      allowedHosts: env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : ['all', 'strapi.dev.autoclub-samurai.ru'],
      port: parseInt(env.VITE_PORT) || 3000,
      cors: false,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_STRAPI_URL,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '/api'),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Для upload запросов не перезаписываем Content-Type и другие заголовки
              if (req.url.includes('/upload')) {
                // Удаляем заголовки, которые могут конфликтовать
                proxyReq.removeHeader('Content-Type');
                proxyReq.removeHeader('Accept');
                // Сохраняем оригинальные заголовки из запроса
                if (req.headers['content-type']) {
                  proxyReq.setHeader('Content-Type', req.headers['content-type']);
                }
              } else {
                proxyReq.setHeader('Accept', 'application/json');
                proxyReq.setHeader('Content-Type', 'application/json');
              }
              proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
            });
          },
          bypass: (req) => {
            if (req.headers.accept?.indexOf('html') !== -1) {
              return '/index.html'
            }
          }
        },
        '/ai-opis': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Content-Security-Policy': `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${env.VITE_ADMIN_FRONTEND_URL} mc.yandex.ru yastatic.net cdn.jsdelivr.net http://localhost:3000 https://localhost:3000 'nonce-erere34r3fdca3df4f'; img-src 'self' ${env.VITE_ADMIN_FRONTEND_URL} https://mc.yandex.ru ${env.VITE_STRAPI_URL} ${env.VITE_API_URL} https://cdn.jsdelivr.net http://localhost:3000 https://localhost:3000 data: blob: https:; child-src blob: https://mc.yandex.ru; worker-src 'self' blob:; frame-src blob: https://mc.yandex.ru; frame-ancestors blob: https://mc.yandex.ru; connect-src 'self' ${env.VITE_ADMIN_FRONTEND_URL} ${env.VITE_STRAPI_URL} ${env.VITE_API_URL} cdn.jsdelivr.net data: localhost:3000 localhost:1337;`
      },
      middleware: [
        history({
          verbose: true,
          disableDotRule: true,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
        })
      ]
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 1100,
      allowedHosts: env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : ['all', 'strapi.dev.autoclub-samurai.ru'],
    },
    base: '/',
    publicDir: 'public',
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
})

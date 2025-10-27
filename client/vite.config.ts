import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Plugins Vite
  plugins: [react()].concat(command === 'serve' ? [
    // Durante o desenvolvimento reescrever requests que começam com /FocoVest/
    // para permitir testar a aplicação no sub-path localmente (dev only).
    // Em produção a opção `base` continua sendo '/FocoVest/'.
    {
      name: 'dev-base-rewrite',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          try {
            if (req.url && req.url.startsWith('/FocoVest/')) {
              // Remove o prefixo /FocoVest para servir index.html corretamente
              req.url = req.url.replace(/^\/FocoVest/, '') || '/'
            }
          } catch (e) {
            // ignore
          }
          return next()
        })
      }
    }
  ] : []),
  // Usar base diferente para desenvolvimento e produção
  base: command === 'serve' ? '/' : '/FocoVest/', // Desenvolvimento: '/' | Produção: '/FocoVest/'
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    // Otimizações para reduzir o tamanho dos chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar vendors em chunks menores
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router-dom')) {
              return 'router-vendor'
            }
            if (id.includes('@headlessui') || id.includes('@heroicons')) {
              return 'ui-vendor'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            if (id.includes('axios') || id.includes('clsx') || id.includes('date-fns')) {
              return 'utility-vendor'
            }
            // Outros vendors
            return 'vendor'
          }
        }
      }
    },
    // Otimizações adicionais
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Compressão de assets
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173, // Porta padrão do Vite (evita conflitos)
    host: 'localhost',
    open: true, // Abre automaticamente o browser
    hmr: {
      port: 24678,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend na porta 5000
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
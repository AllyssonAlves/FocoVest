import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared/dist'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Configurações de segurança para build
    rollupOptions: {
      output: {
        // Ofuscar nomes de arquivos
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Separar dependências de terceiros
        manualChunks: {
          vendor: ['react', 'react-dom'],
          security: ['dompurify', 'crypto-js']
        }
      }
    },
    // Configurações de otimização
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },
    // Source maps apenas para desenvolvimento
    sourcemap: process.env.NODE_ENV === 'development'
  },
  define: {
    // Remove referencias a process.env em produção
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __DEV__: process.env.NODE_ENV === 'development'
  }
})
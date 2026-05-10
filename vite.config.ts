import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self' data: https: wss: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none';"
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
        mangle: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            'vendor-icons': ['lucide-react']
          }
        }
      }
    }
  };
});

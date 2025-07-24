import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Define environment-specific configurations
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    base: '/', // Ensure assets are served from root
    
    server: {
      host: true,
      port: 3000,
      // Only use proxy in development when you want to use local backend
      ...(isDevelopment && {
        proxy: {
          '/api': {
            // Use environment variable or fallback to local
            target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            // Optional: log proxy requests for debugging
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Proxying request to:', proxyReq.getHeader('host') + proxyReq.path)
              })
            }
          },
        }
      })
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment, // Enable sourcemap only in development
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
    },

    // Define environment-specific settings
    define: {
      __DEV__: isDevelopment,
      __PROD__: isProduction,
    },

    // Ensure environment variables are loaded correctly
    envPrefix: 'VITE_'
  }
})
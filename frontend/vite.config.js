import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Define environment-specific configurations
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    
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
      sourcemap: true,
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
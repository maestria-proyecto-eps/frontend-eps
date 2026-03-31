import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy para desarrollo local.
    // Redirige /api/* a los microservicios levantados en localhost.
    // Ajusta los puertos según tu setup local.
    proxy: {
      '/api/auth':            'https://backend-eps-auth-service-xzgs.onrender.com',
      '/api/patients':        'https://backend-eps-auth-service-xzgs.onrender.com',
      '/api/users':           'https://backend-eps-users-service.onrender.com',
      '/api/specialties':     'https://backend-eps-users-service.onrender.com',
      '/api/appointments':    'https://backend-eps-appointments-service.onrender.com',
      '/api/emergency':       'https://backend-eps-emergency-service-xqll.onrender.com',
      '/api/pharmacy':        'https://backend-eps-pharmacy-service.onrender.com',
      '/api/medical-records': 'https://backend-eps-medical-records-service.onrender.com',
    },
  },
    test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})

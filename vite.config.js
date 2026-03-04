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
      '/api/auth':            'https://backend-eps-auth-service.onrender.com',
      '/api/patients':         'https://backend-eps-auth-service.onrender.com',
      '/api/users':           'https://backend-eps-users-service-dev.onrender.com',
      '/api/appointments':    'https://backend-eps-appointments-service-dev.onrender.com',
      '/api/emergency':       'https://backend-eps-emergency-service.onrender.com',
      '/api/pharmacy':        'https://backend-eps-pharmacy-service-dev.onrender.com',
      '/api/medical-records': 'https://backend-eps-medical-records-service-dev.onrender.com',
    },
  },
})

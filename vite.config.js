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
      '/api/auth':            'http://localhost:8001',
      '/api/users':           'http://localhost:8002',
      '/api/appointments':    'http://localhost:8003',
      '/api/emergency':       'http://localhost:8004',
      '/api/pharmacy':        'http://localhost:8005',
      '/api/medical-records': 'http://localhost:8006',
    },
  },
})
